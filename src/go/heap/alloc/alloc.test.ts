import { BuddyAllocator, NUM_SPECIAL_VALUE } from './alloc';

describe('BuddyAllocator', () => {
  it('should allocate and deallocate memory correctly', () => {
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
    const address5 = allocator.allocate(512);
    expect(address5).not.toBeNull();
    allocator.deallocate(address5);

    const address6 = allocator.allocate(513);
    expect(address6).toBeNull();

  });

  it('should handle edge case of allocating maximum memory', () => {
    const allocator = new BuddyAllocator(546 + NUM_SPECIAL_VALUE * 2); // (512 user, 34 kernel)
    // Allocate maximum memory block
    const address = allocator.allocate(512);
    expect(address).not.toBeNull();
    // Try to allocate more memory
    const address2 = allocator.allocate(1);
    expect(address2).toBeNull();
    // Deallocate memory block
    allocator.deallocate(address);
    allocator.deallocate(address2); // handle null

    const address3 = allocator.allocate(513);
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

  it('should handle reverse deallocation', () => {
    const allocator = new BuddyAllocator(1024); // Allocate 1024 words of memory
    // Allocate memory blocks
    // 972 words = 512 + 256 + 128 + 64 + 8 + 4
    const address1 = allocator.allocate(100);
    const address2 = allocator.allocate(200);
    const address3 = allocator.allocate(100);

    expect(address1).not.toBeNull();
    expect(address2).not.toBeNull();
    expect(address3).not.toBeNull();

    allocator.deallocate(address3);
    allocator.deallocate(address2);
    allocator.deallocate(address1);
  });

  it('should handle mark_and_sweep', () => {
    const allocator = new BuddyAllocator(1024 + NUM_SPECIAL_VALUE * 2);
    // Allocate memory blocks
    // 972 words = 512 + 256 + 128 + 64 + 8 + 4
    const address1 = allocator.allocate(100);
    const address2 = allocator.allocate(200);
    const address3 = allocator.allocate(100);

    expect(address1).not.toBeNull();
    expect(address2).not.toBeNull();
    expect(address3).not.toBeNull();

    allocator.sweep_and_free();

    for (let i = 0; i < 3; i++) {
      const address4 = allocator.allocate(512);
      const address5 = allocator.allocate(256);
      const address6 = allocator.allocate(128);
      const address7 = allocator.allocate(64);
      const address8 = allocator.allocate(8);
      const address9 = allocator.allocate(4);

      expect(address4).not.toBeNull();
      expect(address5).not.toBeNull();
      expect(address6).not.toBeNull();
      expect(address7).not.toBeNull();
      expect(address8).not.toBeNull();
      expect(address9).not.toBeNull();

      allocator.sweep_and_free();
    }

    const address10 = allocator.allocate(512);
    const address11 = allocator.allocate(256);
    const address12 = allocator.allocate(128);
    for (let i = 0; i < 8; i++) {
      const address13 = allocator.allocate(8);
      expect(address13).not.toBeNull();
    }
    const address14 = allocator.allocate(8);
    const address15 = allocator.allocate(4);

    expect(address10).not.toBeNull();
    expect(address11).not.toBeNull();
    expect(address12).not.toBeNull();
    expect(address14).not.toBeNull();
    expect(address15).not.toBeNull();

    allocator.sweep_and_free();
    for (let i = 0; i < 3; i++) {
      const address4 = allocator.allocate(512);
      const address5 = allocator.allocate(256);
      const address6 = allocator.allocate(128);
      const address7 = allocator.allocate(64);
      const address8 = allocator.allocate(8);
      const address9 = allocator.allocate(4);

      expect(address4).not.toBeNull();
      expect(address5).not.toBeNull();
      expect(address6).not.toBeNull();
      expect(address7).not.toBeNull();
      expect(address8).not.toBeNull();
      expect(address9).not.toBeNull();

      allocator.sweep_and_free();
    }
  });

  it('should handle mark_and_sweep', () => {
    const allocator = new BuddyAllocator(64 + NUM_SPECIAL_VALUE * 2);
    // 50 words in total
    
    const address1 = allocator.allocate(32);
    const address2a = allocator.allocate(8);
    const address2b = allocator.allocate(8);    
    const address3 = allocator.allocate(2);
    
    expect(address1).not.toBeNull();
    expect(address2a).not.toBeNull();
    expect(address2b).not.toBeNull();
    expect(address3).not.toBeNull();

    allocator.sweep_and_free();
    for (let i = 0; i < 3; i++) {
      const address4 = allocator.allocate(32);
      const address5 = allocator.allocate(16);
      const address6 = allocator.allocate(2);

      expect(address4).not.toBeNull();
      expect(address5).not.toBeNull();
      expect(address6).not.toBeNull();

      allocator.sweep_and_free();
    }
  });

  it('should handle cannot-be-freed', () => {
    const allocator = new BuddyAllocator(64 + NUM_SPECIAL_VALUE * 2);
    // 50 words in total

    const address1 = allocator.allocate(32);
    const address2 = allocator.allocate(16);
    const address3 = allocator.allocate(2);

    expect(address1).not.toBeNull();
    expect(address2).not.toBeNull();
    expect(address3).not.toBeNull();

    allocator.set_cannot_be_freed(address2, true);
    allocator.deallocate(address2);

    const address4 = allocator.allocate(16);
    expect(address4).toBeNull();

    allocator.sweep_and_free();

    const address5 = allocator.allocate(32);
    const address6 = allocator.allocate(16);
    const address7 = allocator.allocate(2);

    expect(address5).not.toBeNull();
    expect(address6).toBeNull();
    expect(address7).not.toBeNull();

    allocator.set_cannot_be_freed(address2, false);
    allocator.sweep_and_free();

    const address8 = allocator.allocate(32);
    const address9 = allocator.allocate(16);
    const address10 = allocator.allocate(2);

    expect(address8).not.toBeNull();
    expect(address9).not.toBeNull();
    expect(address10).not.toBeNull();
  });
});
