import { BuddyAllocator } from './alloc';

describe('BuddyAllocator', () => {
  it('should allocate and deallocate memory correctly', () => {
    // Allocate 1024 words of memory = 499 nodes
    const allocator = new BuddyAllocator(1024);

    // Allocate memory blocks
    const address1 = allocator.allocate(100);
    const address2 = allocator.allocate(200);
    const address3 = allocator.allocate(100);

    expect(address1).not.toBeNull();
    expect(address2).not.toBeNull();
    expect(address3).not.toBeNull();

    // Deallocate memory blocks
    allocator.deallocate(address1);
    allocator.deallocate(address2);
    allocator.deallocate(address3);

    // Allocate memory block again
    const address4 = allocator.allocate(450);

    expect(address4).not.toBeNull();

    // Deallocate memory block again
    allocator.deallocate(address4);
  });

  it('should return null when memory limit is exceeded', () => {
    const allocator = new BuddyAllocator(100); // Allocate 100 words of memory

    // Allocate memory block
    const address = allocator.allocate(200);

    expect(address).toBeNull();
  });

  it('should return null when no suitable memory block is available', () => {
    const allocator = new BuddyAllocator(1024); // Allocate 1024 words of memory

    // Allocate memory blocks
    const address1 = allocator.allocate(100);
    const address2 = allocator.allocate(200);

    expect(address1).not.toBeNull();
    expect(address2).not.toBeNull();

    // Allocate memory block again
    const address3 = allocator.allocate(500);

    expect(address3).not.toBeNull();

    // Deallocate memory blocks
    allocator.deallocate(address1);
    allocator.deallocate(address2);
  });

  it('should handle multiple allocations and deallocations', () => {
    const allocator = new BuddyAllocator(1024); // Allocate 1024 words of memory

    // Allocate memory blocks
    const address1 = allocator.allocate(100);
    const address2 = allocator.allocate(200);

    expect(address1).not.toBeNull();
    expect(address2).not.toBeNull();

    allocator.deallocate(address1);
    allocator.deallocate(address2);

    const address3 = allocator.allocate(300);
    expect(address3).not.toBeNull();
    allocator.deallocate(address3);

    const address4 = allocator.allocate(400);
    expect(address4).not.toBeNull();
    allocator.deallocate(address4);

    // Allocate memory block again
    const address5 = allocator.allocate(511);
    expect(address5).not.toBeNull();
    allocator.deallocate(address5);

    const address6 = allocator.allocate(512);
    expect(address6).toBeNull();

  });

  it('should handle edge case of allocating maximum memory', () => {
    const allocator = new BuddyAllocator(534); // Allocate 534 words of memory (512 user, 22 kernel)
    // Allocate maximum memory block
    const address = allocator.allocate(511);
    expect(address).not.toBeNull();
    // Try to allocate more memory
    const address2 = allocator.allocate(1);
    expect(address2).toBeNull();
    // Deallocate memory block
    allocator.deallocate(address);
    allocator.deallocate(address2); // handle null

    const address3 = allocator.allocate(512);
    expect(address3).toBeNull();
  });

  it('should handle large memory', () => {
    const allocator = new BuddyAllocator(1024 * 1024 * 1024); // Allocate 8GB of memory
    // Allocate maximum memory block
    const address = allocator.allocate(1024 * 1024 * 1024 / 2 - 1);
    expect(address).not.toBeNull();
    // Deallocate memory block
    allocator.deallocate(address);
  });
});
