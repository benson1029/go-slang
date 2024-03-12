const WORD_SIZE       = 4; // 2^2 = 4 bytes.

// All values below are in words.
const MIN_ALLOC_LOG2  = 1;
const MIN_ALLOC       = 2 ** MIN_ALLOC_LOG2;
const MAX_ALLOC_LOG2  = 31;
const MAX_ALLOC       = 2 ** MAX_ALLOC_LOG2;

class BuddyAllocator {
  private data: ArrayBuffer;
  private memory: DataView;

  /**
   * Partially adapted from https://github.com/evanw/buddy-malloc/blob/master/buddy-malloc.c
   *
   * Assumption: memory at most 2^33 bytes.
   * Apparently ArrayBuffer is limited to 2^33 bytes on 64-bit systems (Firefox 89).
   * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Invalid_array_length
   *
   * We split memory into [kernel] and [user].
   *
   * [user]:
   * - can contain memorySize words in total
   * - we keep blocks with size 2^x words, x >= 1
   * - unused blocks keep prev and next pointers for free list
   *
   * [kernel]:
   * - free list for each bucket
   * - binary tree: numNodes bits, represents 1-indexed binary tree
   */

  private numNodes: number;       // number of nodes in binary tree
  private numNodesLog2: number;

  private baseUser: number;       // base address of [user] memory
  private endUser: number;        // end  address of [user] memory
  // baseUser + i: 0 <= i < memorySize

  private baseFreeList: number;   // base address of free list buckets
  // baseFreeList + i: free list for 2^{numNodesLog2 - i + MIN_ALLOC_LOG2} words, 0 <= i < BUCKET_COUNT

  private baseBinaryTree: number; // base address of is_split memory
  // baseBinaryTree + i: 1-indexed binary tree, 1 <= i <= 2^{numNodesLog2 - 1}
  // the value of (2i)-th and (2i+1)-bit represents whether its children is in the free list

  public memory_get_float32(address: number): number {
    return this.memory.getFloat32(address);
  }

  public memory_set_float32(address: number, value: number): void {
    this.memory.setFloat32(address, value);
  }

  public memory_get_word(address: number): number {
    return this.memory.getInt32(address);
  }

  public memory_set_word(address: number, value: number): void {
    this.memory.setInt32(address, value);
  }

  public memory_get_byte(address: number): number {
    return this.memory.getInt8(address);
  }

  public memory_set_byte(address: number, value: number): void {
    this.memory.setInt8(address, value);
  }

  public memory_get_2_bytes(address: number): number {
    return this.memory.getInt16(address);
  }

  public memory_set_2_bytes(address: number, value: number): void {
    this.memory.setInt16(address, value);
  }

  public memory_get_bit(address: number, bit: number): boolean {
    const value = this.memory_get_byte(address);
    return (value & (1 << bit)) !== 0;
  }

  public memory_set_bit(address: number, bit: number, value: boolean): void {
    const oldValue = this.memory_get_byte(address);
    if (value) {
      this.memory_set_byte(address, oldValue | (1 << bit));
    } else {
      this.memory_set_byte(address, oldValue & ~(1 << bit));
    }
  }

  public set_mark_and_sweep(address: number, value: boolean): void {
    this.memory_set_bit(address, 5, value);
  }

  public get_mark_and_sweep(address: number): boolean {
    return this.memory_get_bit(address, 5);
  }

  public set_cannnot_be_freed(address: number, value: boolean): void {
    this.memory_set_bit(address, 6, value);
  }

  public get_cannnot_be_freed(address: number): boolean {
    return this.memory_get_bit(address, 6);
  }

  private get_bucket(words: number): number | null {
    if (words > MAX_ALLOC) {
      return null;
    }

    let s = MIN_ALLOC_LOG2;
    while ((2 ** s) < words) {
      s += 1;
    }
    if (s > this.numNodesLog2 + MIN_ALLOC_LOG2) {
      return null;
    }
    return this.numNodesLog2 + MIN_ALLOC_LOG2 - s;
  }

  public bucket_to_words(bucket: number): number {
    return 2 ** (this.numNodesLog2 + MIN_ALLOC_LOG2 - bucket);
  }

  private init_free_list(bucket: number): void {
    const head = this.baseFreeList + bucket * MIN_ALLOC * WORD_SIZE;
    this.memory_set_word(head, head);     // prev
    this.memory_set_word(head + WORD_SIZE, head); // next
  }

  private insert_free_list(bucket: number, address: number): void {
    const node = this.pointer_to_node(address, bucket);
    this.toggle_node_status(node);

    const head = this.baseFreeList + bucket * MIN_ALLOC * WORD_SIZE;
    const next = this.memory_get_word(head + WORD_SIZE);
    this.memory_set_word(address, head);
    this.memory_set_word(address + WORD_SIZE, next);
    this.memory_set_word(head + WORD_SIZE, address);
    this.memory_set_word(next, address);
  }

  private remove_free_list(bucket: number, address: number): void {
    const node = this.pointer_to_node(address, bucket);
    this.toggle_node_status(node);

    const prev = this.memory_get_word(address);
    const next = this.memory_get_word(address + WORD_SIZE);
    this.memory_set_word(prev + WORD_SIZE, next);
    this.memory_set_word(next, prev);
  }

  private pop_free_list(bucket: number): number | null {
    const head = this.baseFreeList + bucket * MIN_ALLOC * WORD_SIZE;
    const address = this.memory_get_word(head);

    if (head === address) {
      return null;
    }

    this.remove_free_list(bucket, address);
    return address;
  }

  private node_to_pointer(node: number, bucket: number): number {
    const multiplier = 2 ** (this.numNodesLog2 - bucket);
    return this.baseUser + (node - (2 ** bucket)) * multiplier * MIN_ALLOC * WORD_SIZE;
  }

  private pointer_to_node(pointer: number, bucket: number): number {
    const multiplier = 2 ** (this.numNodesLog2 - bucket);
    return (pointer - this.baseUser) / multiplier / MIN_ALLOC / WORD_SIZE + (2 ** bucket);
  }

  private toggle_node_status(node: number): void {
    const ch = node % 2    // left child or right child
    node = (node - ch) / 2 // get parent
    const bit_offset = node * 2 + ch

    const bit = bit_offset % 8;
    const byte = (bit_offset - bit) / 8;
    const address = this.baseBinaryTree + byte;
    const bit_value = this.memory_get_bit(address, bit);
    this.memory_set_bit(address, bit, !bit_value);
  }

  private is_sibling_free(node: number): boolean {
    const ch = node % 2    // left child or right child
    node = (node - ch) / 2 // get parent
    const bit_offset = node * 2 + (1 - ch)

    const bit = bit_offset % 8;
    const byte = (bit_offset - bit) / 8;
    const address = this.baseBinaryTree + byte;
    return this.memory_get_bit(address, bit);
  }

  private is_self_free(node: number): boolean {
    const ch = node % 2    // left child or right child
    node = (node - ch) / 2 // get parent
    const bit_offset = node * 2 + ch

    const bit = bit_offset % 8;
    const byte = (bit_offset - bit) / 8;
    const address = this.baseBinaryTree + byte;
    return this.memory_get_bit(address, bit);
  }

  private write_bucket_value(address: number, bucket: number): void {
    for (let i = 0; i < 5; i++) {
      this.memory_set_bit(address, i, (bucket & (1 << i)) !== 0);
    }
  }

  private read_bucket_value(address: number): number {
    let bucket = 0;
    for (let i = 0; i < 5; i++) {
      if (this.memory_get_bit(address, i)) {
        bucket |= (1 << i);
      }
    }
    return bucket;
  }

  constructor(words: number) {
    if (words > MAX_ALLOC) {
      throw new Error("Memory limit too high. Cannot allocate memory.");
    }

    try {
      this.data = new ArrayBuffer(words * WORD_SIZE);
    } catch (error) {
      if (error instanceof RangeError) {
        throw new Error("Memory limit too high. Cannot allocate memory.");
      }
      throw error;
    }

    this.memory = new DataView(this.data);

    { // Calculate number of nodes in binary tree
      const num_bytes = words * WORD_SIZE;
      const pad_bits = (num_bits: number) => {
        while (num_bits % (WORD_SIZE * 8) !== 0) {
          num_bits += 1;
        }
        return num_bits / 8;
      };

      const log2_ceil = (num: number) => {
        let re = 0;
        while ((2 ** re) < num) {
          re += 1;
        }
        return re;
      };

      const num_bytes_needed = (num_nodes: number) => {
        // Assume node is a power of 2
        let num = 0

        // Reserved for nil node
        num += MIN_ALLOC * WORD_SIZE;

        // User nodes
        num += num_nodes * (MIN_ALLOC * WORD_SIZE);

        // Free list nodes
        num += (log2_ceil(num_nodes) + 1) * (MIN_ALLOC * WORD_SIZE);

        // Binary tree nodes
        num += pad_bits((2 ** log2_ceil(num_nodes)) * 2)

        return num;
      };

      if (num_bytes_needed(1) > num_bytes) {
        throw new Error("Memory limit too low. Cannot allocate any memory for user space.");
      }

      this.numNodes = 0;
      for (let i = MAX_ALLOC_LOG2; i >= 0; i--) {
        if (num_bytes_needed(this.numNodes + (2 ** i)) <= num_bytes) {
          this.numNodes += (2 ** i);
        }
      }
      this.numNodesLog2 = log2_ceil(this.numNodes);

      let currentSize = 0;
      currentSize += MIN_ALLOC * WORD_SIZE; // Reserved for nil node

      // Initialize free list space
      this.baseFreeList = currentSize;
      currentSize += (this.numNodesLog2 + 1) * MIN_ALLOC * WORD_SIZE;

      // Initialize binary tree space
      this.baseBinaryTree = currentSize;
      currentSize += pad_bits((2 ** this.numNodesLog2) * 2);

      // Initialize user space
      this.baseUser = currentSize;
      currentSize += this.numNodes * MIN_ALLOC * WORD_SIZE;

      // Initialize free list
      let address = this.baseUser;
      this.endUser = this.baseUser + this.numNodes * MIN_ALLOC * WORD_SIZE;
      for (let i = this.numNodesLog2; i >= 0; i--) {
        const bucket = this.numNodesLog2 - i
        this.init_free_list(bucket);
        const new_address = address + (2 ** i) * MIN_ALLOC * WORD_SIZE;
        if (new_address <= this.endUser) {
          this.insert_free_list(bucket, address);
          address = new_address
        }
      }
      // console.assert(address === this.endUser);
      // console.log("Memory allocated:", this.numNodes, this.baseUser / WORD_SIZE, words, currentSize / WORD_SIZE);
    }
  }

  public allocate(words: number): number | null {
    if (words <= 0) {
      return null;
    }

    const bucket = this.get_bucket(words);
    if (bucket === null) {
      return null;
    }

    let i = null;
    let address = null;
    for (i = bucket; i >= 0; i--) {
      address = this.pop_free_list(i);
      if (address !== null) {
        break;
      }
    }

    // No block found
    if (address === null) {
      return null;
    }

    // Split
    while (i < bucket) {
      i += 1; // move to left child
      // console.log("Split", address / WORD_SIZE, i)
      const node = this.pointer_to_node(address, i);
      const buddy = this.node_to_pointer(node ^ 1, i);
      this.insert_free_list(i, buddy);
    }

    // We initialize everything to 0
    for (let j = 0; j < words; j++) {
      this.memory_set_word(address + j * WORD_SIZE, 0);
    }

    // We also keep the bucket value on first 5 bits of the first word
    this.write_bucket_value(address, bucket);

    // console.log("Allocate:", address / WORD_SIZE, bucket)
    return address;
  }

  public deallocate(address: number): void {
    if (address === null || address === 0 || this.get_cannnot_be_freed(address)) {
      return;
    }

    let bucket = this.read_bucket_value(address);
    let node = this.pointer_to_node(address, bucket);

    // console.log("Deallocate", address / WORD_SIZE, bucket)

    while (bucket >= 0) {
      if (this.is_sibling_free(node)) {
        // Buddy is in free list
        // console.log("Merge", address / WORD_SIZE, bucket)
        const buddy = this.node_to_pointer(node ^ 1, bucket);
        this.remove_free_list(bucket, buddy);
        node = (node - (node % 2)) / 2;
        bucket -= 1;
      } else {
        // Buddy is not in free list
        // console.log("Free", this.node_to_pointer(node, bucket) / WORD_SIZE, bucket)
        this.insert_free_list(bucket, this.node_to_pointer(node, bucket));
        break;
      }
    }
  }

  // Free all nodes with mark/sweep bit 0
  public sweep_and_free(): void {
    // console.log("Sweep and free");

    let node = 1;
    let bucket = 0;
    let address = this.node_to_pointer(node, bucket);
    while (address < this.endUser) {
      let nodeAddressStart = this.node_to_pointer(node, bucket);
      let nodeAddressEnd = nodeAddressStart + this.bucket_to_words(bucket) * WORD_SIZE;

      // console.assert(nodeAddressStart <= address);

      if (address >= nodeAddressEnd) {
        // address not reachable from current node
        node = (node - (node % 2)) / 2;
        bucket -= 1;
        continue;
      }

      // console.assert(nodeAddressStart <= address && address < nodeAddressEnd);

      if (this.is_self_free(node)) {
        address = nodeAddressEnd;
        continue;
      }

      // current address is allocated
      if (bucket === this.numNodesLog2) {
        if (this.get_mark_and_sweep(address) || this.get_cannnot_be_freed(address)) {
          // already marked, this node is alive
          // we reset the mark bit
          this.set_mark_and_sweep(address, false);
          const allocated_bucket = this.read_bucket_value(address);
          address += this.bucket_to_words(allocated_bucket) * WORD_SIZE;
        } else {
          // not marked, this node is dead
          // we deallocate this node
          this.deallocate(address);

          // address deallocated, we need which level it got put in free list
          while (!this.is_self_free(node)) {
            node = (node - (node % 2)) / 2;
            bucket -= 1;
          }

          // node is in the free list, we move to something after this node
          address = this.node_to_pointer(node, bucket) + this.bucket_to_words(bucket) * WORD_SIZE;
        }
      } else {
        // need to check whether address is allocated or not
        const nodeAddressMiddle = this.node_to_pointer(node * 2 + 1, bucket + 1);
        if (address < nodeAddressMiddle) {
          // address is in left child
          node = node * 2;
          bucket += 1;
        } else {
          // address is in right child
          node = node * 2 + 1;
          bucket += 1;
        }
      }
    }
  }
}

export { BuddyAllocator, WORD_SIZE };
