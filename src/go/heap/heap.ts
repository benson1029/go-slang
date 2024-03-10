import { BuddyAllocator } from "../alloc";

// TODO: Store the contents in the BuddyAllocator. This is a placeholder.
class Heap {
    private heap: BuddyAllocator;

    constructor(memory: number) {
        this.heap = new BuddyAllocator(memory);
    }

    public allocate_number(value: number): number {
        return value;
    }

    public value_of(address: number): number {
        return address;
    }
}

export { Heap };
