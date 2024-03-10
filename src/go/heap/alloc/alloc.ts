const WORD_SIZE       = 8; // 2^3 = 8 bytes. All values below are in words.

const HEADER_SIZE     = 1;

const MIN_ALLOC_LOG2  = 1;
const MIN_ALLOC       = 1 << MIN_ALLOC_LOG2;

const MAX_ALLOC_LOG2  = 30;
const MAX_ALLOC       = 1 << MAX_ALLOC_LOG2;

class BuddyAllocator {
  private data: ArrayBuffer;
  private memory: DataView;

  /**
   * Partially adapted from https://github.com/evanw/buddy-malloc/blob/master/buddy-malloc.c
   *
   * Assumption: memory at most 2^33 bytes.
   * Apparently ArrayBuffer is limited to 2^33 bytes on 64-bit systems (Firefox 89).
   * Therefore, at most 2^30 nodes in binary tree. We can use << and >> without overflow.
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
  // baseUser + i: 0 <= i < memorySize

  private baseFreeList: number;   // base address of free list buckets
  // baseFreeList + i: free list for 2^{MIN_ALLOC_LOG2 + i} words, 0 <= i < BUCKET_COUNT

  private baseBinaryTree: number; // base address of is_split memory
  // baseBinaryTree + i: 1-indexed binary tree, 1 <= i <= 2^{numNodesLog2 - 1}
  // the value of i-th bit represents how many of its children is in free list, mod 2

  private memory_get_64(address: number): number {
    return this.memory.getFloat64(address * WORD_SIZE);
  }

  private memory_set_64(address: number, value: number): void {
    this.memory.setFloat64(address * WORD_SIZE, value);
  }

  private get_bucket(size: number): number | null {
    // Size is in words
    if (size > MAX_ALLOC) {
      return null;
    }

    let s = MIN_ALLOC_LOG2;
    while ((1 << s) < size) {
      s += 1;
    }
    if (s > this.numNodesLog2 + MIN_ALLOC_LOG2) {
      return null;
    }
    return this.numNodesLog2 + MIN_ALLOC_LOG2 - s;
  }

  private init_free_list(bucket: number): void {
    const head = this.baseFreeList + bucket * MIN_ALLOC;
    this.memory_set_64(head, head);     // prev
    this.memory_set_64(head + 1, head); // next
  }

  private insert_free_list(bucket: number, address: number): void {
    const node = this.pointer_to_node(address, bucket);
    this.toggle_split_parent(node);

    const head = this.baseFreeList + bucket * MIN_ALLOC;
    const next = this.memory_get_64(head + 1);
    this.memory_set_64(address, head);      // prev
    this.memory_set_64(address + 1, next);  // next
    this.memory_set_64(head + 1, address);  // next
    this.memory_set_64(next, address);      // prev
  }

  private remove_free_list(bucket: number, address: number): void {
    const node = this.pointer_to_node(address, bucket);
    this.toggle_split_parent(node);

    const prev = this.memory_get_64(address);
    const next = this.memory_get_64(address + 1);
    this.memory_set_64(prev + 1, next);
    this.memory_set_64(next, prev);
  }

  private pop_free_list(bucket: number): number | null {
    const head = this.baseFreeList + bucket * MIN_ALLOC;
    const address = this.memory_get_64(head);

    if (head === address) {
      return null;
    }

    this.remove_free_list(bucket, address);
    return address;
  }

  private node_to_pointer(node: number, bucket: number): number {
    const multiplier = 1 << (this.numNodesLog2 - bucket);
    return this.baseUser + (node - (1 << bucket)) * multiplier * MIN_ALLOC;
  }

  private pointer_to_node(pointer: number, bucket: number): number {
    const multiplier = 1 << (this.numNodesLog2 - bucket);
    return (pointer - this.baseUser) / MIN_ALLOC / multiplier + (1 << bucket);
  }

  private toggle_split_parent(node: number): void {
    node = node >> 1 // get parent
    const bit = node % 8;
    const byte = (node - bit) / 8;
    const address = this.baseBinaryTree * WORD_SIZE + byte;
    const value = this.memory.getUint8(address);
    this.memory.setUint8(address, value ^ (1 << bit));
  }

  private is_split_parent(node: number): boolean {
    node = node >> 1 // get parent
    const bit = node % 8;
    const byte = (node - bit) / 8;
    const address = this.baseBinaryTree * WORD_SIZE + byte;
    const value = this.memory.getUint8(address);
    return (value & (1 << bit)) !== 0;
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
        while ((1 << re) < num) {
          re += 1;
        }
        return re;
      };

      const num_bytes_needed = (num_nodes: number) => {
        // Assume node is a power of 2
        let num = 0

        // User nodes
        num += num_nodes * (MIN_ALLOC * WORD_SIZE);

        // Free list nodes
        num += (log2_ceil(num_nodes) + 1) * (MIN_ALLOC * WORD_SIZE);

        // Binary tree nodes
        num += pad_bits(1 << log2_ceil(num_nodes));

        return num;
      };

      if (num_bytes_needed(1) > num_bytes) {
        throw new Error("Memory limit too low. Cannot allocate any memory for user space.");
      }

      this.numNodes = 0;
      for (let i = MAX_ALLOC_LOG2; i >= 0; i--) {
        if (num_bytes_needed(this.numNodes + (1 << i)) <= num_bytes) {
          this.numNodes += (1 << i);
        }
      }
      this.numNodesLog2 = log2_ceil(this.numNodes);

      let currentSize = 0;

      // Initialize free list space
      this.baseFreeList = currentSize;
      currentSize += (this.numNodesLog2 + 1) * MIN_ALLOC;

      // Initialize binary tree space
      this.baseBinaryTree = currentSize;
      currentSize += pad_bits(1 << this.numNodesLog2) / WORD_SIZE;

      // Initialize user space
      this.baseUser = currentSize;
      currentSize += this.numNodes * MIN_ALLOC;

      // Initialize free list
      let address = this.baseUser;
      for (let i = this.numNodesLog2; i >= 0; i--) {
        const bucket = this.numNodesLog2 - i
        this.init_free_list(bucket);
        if ((this.numNodes & (1 << i)) !== 0) {
          this.insert_free_list(bucket, address);
          address += (1 << i) * MIN_ALLOC;
        }
      }
    }
  }

  allocate(size: number): number | null {
    const bucket = this.get_bucket(size + HEADER_SIZE);
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
      const node = this.pointer_to_node(address, i);
      const buddy = this.node_to_pointer(node ^ 1, i);
      this.insert_free_list(i, buddy);
    }

    this.memory_set_64(address, size);
    return address + HEADER_SIZE;
  }

  deallocate(address: number): void {
    if (address === null) {
      return;
    }

    address -= HEADER_SIZE;
    const size = this.memory_get_64(address);
    let bucket = this.get_bucket(size + HEADER_SIZE);

    if (bucket === null) {
      // This should never happen.
      // Possibly double free or memory corruption.
      return;
    }

    let node = this.pointer_to_node(address, bucket);
    while (bucket >= 0) {
      if (this.is_split_parent(node)) {
        // Buddy is in free list
        const buddy = this.node_to_pointer(node ^ 1, bucket);
        this.remove_free_list(bucket, buddy);
        node = node >> 1;
        bucket -= 1;
      } else {
        // Buddy is not in free list
        this.insert_free_list(bucket, address);
        break;
      }
    }
  }
}

export { BuddyAllocator };
