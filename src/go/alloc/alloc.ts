import { assert, error } from "console";

const WORD_SIZE       = 8; // 2^3 = 8 bytes. All values below are in words.

const HEADER_SIZE     = 1;

const MIN_ALLOC_LOG2  = 1;
const MIN_ALLOC       = 1 << MIN_ALLOC_LOG2;

const MAX_ALLOC_LOG2  = 48;
const MAX_ALLOC       = 1 << MAX_ALLOC_LOG2;

class BuddyAllocator {
  private data: ArrayBuffer;
  private memory: DataView;

  /**
   * Partially adapted from https://github.com/evanw/buddy-malloc/blob/master/buddy-malloc.c
   *
   * Assumption: memory at most 2^51 bytes.
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

  private numNodesLog2: number;   // number of nodes in binary tree, in log2

  private baseUser: number;       // base address of [user] memory
  // baseUser + i: 0 <= i < memorySize

  private baseFreeList: number;   // base address of free list buckets
  // baseFreeList + i: free list for 2^{MIN_ALLOC_LOG2 + i} words, 0 <= i < BUCKET_COUNT

  private baseBinaryTree: number; // base address of is_split memory
  // baseBinaryTree + i: 1-indexed binary tree, 1 <= i <= 2^{numNodesLog2 - 1}

  private memory_get_64(address: number): number {
    return this.memory.getFloat64(address * WORD_SIZE);
  }

  private memory_set_64(address: number, value: number): void {
    this.memory.setFloat64(address * WORD_SIZE, value);
  }

  private get_bucket(size: number): number | null {
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
    const head = this.baseFreeList + bucket * MIN_ALLOC;
    const next = this.memory_get_64(head + 1);
    this.memory_set_64(address, head);      // prev
    this.memory_set_64(address + 1, next);  // next
    this.memory_set_64(head + 1, address);  // next
    this.memory_set_64(next, address);      // prev
  }

  private remove_free_list(address: number): void {
    const prev = this.memory_get_64(address);
    const next = this.memory_get_64(address + 1);
    this.memory_set_64(prev + 1, next);
    this.memory_set_64(next, prev);
  }

  private pop_free_list(bucket: number): number | null {
    const head = this.baseFreeList + bucket * MIN_ALLOC;
    const prev = this.memory_get_64(head);

    if (head === prev) {
      return null;
    }

    this.remove_free_list(prev);
    return prev;
  }

  private node_to_pointer(node: number, bucket: number): number {
    return this.baseUser + ((node - (1 << bucket)) << (this.numNodesLog2 - bucket)) * MIN_ALLOC;
  }

  private pointer_to_node(pointer: number, bucket: number): number {
    return (((pointer - this.baseUser) / MIN_ALLOC) >> (this.numNodesLog2 - bucket)) + (1 << bucket);
  }

  private toggle_split(node: number): void {
    const bit = node % 8;
    const byte = (node - bit) / 8;
    const address = this.baseBinaryTree * WORD_SIZE + byte;
    const value = this.memory.getUint8(address);
    this.memory.setUint8(address, value ^ (1 << bit));
  }

  private is_split(node: number): boolean {
    const bit = node % 8;
    const byte = (node - bit) / 8;
    const address = this.baseBinaryTree * WORD_SIZE + byte;
    const value = this.memory.getUint8(address);
    return (value & (1 << bit)) !== 0;
  }

  constructor(words: number) {
    if (words > MAX_ALLOC) {
      error("Memory limit too high. Cannot allocate memory.");
    }

    this.data = new ArrayBuffer(words * WORD_SIZE);
    this.memory = new DataView(this.data);

    { // Calculate number of nodes in binary tree
      const num_bytes = words * WORD_SIZE
      const pad_bits = (num_bits: number) => {
        while (num_bits % (WORD_SIZE * 8) !== 0) {
          num_bits += 1;
        }
        return num_bits / 8;
      };

      const num_bytes_needed = (node_log2: number) => {
        // Assume node is a power of 2
        let num = 0

        // User nodes
        num += (1 << node_log2) * (MIN_ALLOC * WORD_SIZE);

        // Free list nodes
        num += (node_log2 + 1) * (MIN_ALLOC * WORD_SIZE);

        // Binary tree nodes
        num += pad_bits(1 << node_log2);

        return num;
      };

      if (num_bytes_needed(1) > num_bytes) {
        error("Memory limit too low. Cannot allocate any memory for user space.");
      }

      this.numNodesLog2 = 0;
      while (this.numNodesLog2 + 1 <= MAX_ALLOC_LOG2 - MIN_ALLOC_LOG2 &&
             num_bytes_needed(this.numNodesLog2 + 1) <= num_bytes) {
        this.numNodesLog2 += 1;
      }

      let currentSize = 0;

      { // Initialize free list
        this.baseFreeList = currentSize;
        currentSize += (this.numNodesLog2 + 1) * MIN_ALLOC;
        for (let i = 0; i <= this.numNodesLog2; i++) {
          this.init_free_list(i);
        }
      }

      { // Initialize binary tree
        this.baseBinaryTree = currentSize;
        currentSize += pad_bits(1 << this.numNodesLog2) / WORD_SIZE;
      }

      { // Initialize user space
        this.baseUser = currentSize;
        currentSize += (1 << this.numNodesLog2) * MIN_ALLOC;
        this.insert_free_list(0, this.node_to_pointer(1, 0));
      }

      assert(currentSize <= num_bytes);
    }
  }

  allocate(size: number): number | null {
    const bucket = this.get_bucket(size + HEADER_SIZE);
    if (bucket === null) {
      return null;
    }

    let address = this.pop_free_list(bucket);
    if (address === null) {
      // Try to find a larger block
      let i = bucket - 1;
      while (i >= 0) {
        address = this.pop_free_list(i);
        if (address !== null) {
          break;
        }
        i -= 1;
      }

      // No larger block found
      if (address === null) {
        return null;
      }

      // Split
      while (i < bucket) {
        i += 1; // move to left child
        const node = this.pointer_to_node(address, i);
        const buddy = this.node_to_pointer(node ^ 1, i);
        this.insert_free_list(i, buddy);
        this.toggle_split(node >> 1);
      }
    }

    this.memory_set_64(address, size);
    return address + HEADER_SIZE;
  }

  deallocate(address: number): void {
    address -= HEADER_SIZE;
    const size = this.memory_get_64(address);
    let bucket = this.get_bucket(size + HEADER_SIZE);

    if (bucket === null) {
      // This should never happen.
      // Possibly double free or memory corruption.
      return;
    }

    let node = this.pointer_to_node(address, bucket);
    while (bucket > 0) {
      this.toggle_split(node >> 1); // toggle split of parent

      if (this.is_split(node >> 1)) {
        // Buddy is still in use
        break;
      }

      // Buddy is free
      const buddy = this.node_to_pointer(node ^ 1, bucket);
      this.remove_free_list(buddy);
      node = node >> 1;
      bucket -= 1;
    }

    this.insert_free_list(bucket, address);
  }
}


export { BuddyAllocator };
