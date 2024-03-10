/**
 * The stash of the ECE. The content is stored inside the heap. The stash only
 * contains addresses to the heap.
 */
class Stash {
    private stash: Array<number>;

    /**
     * Creates an empty stash.
     */
    constructor() {
        this.stash = [];
    }

    /**
     * Pushes a new value onto the stash.
     * 
     * @param value The address to push onto the stash.
     */
    public push(value: number): void {
        this.stash.push(value);
    }

    /**
     * Pops the top element of the stash.
     * 
     * @returns The top element of the stash.
     */
    public pop(): number {
        return this.stash.pop();
    }
}

export { Stash };
