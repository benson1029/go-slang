/**
 * The control stack of the ECE. The content is currently stored outside the
 * heap.
 */
class Control {
    private control: Array<object>;

    /**
     * Creates a new instance of the control stack.
     * 
     * @param cmd The program to evaluate.
     */
    constructor(cmd: object) {
        this.control = [cmd];
    }

    /**
     * Pops the top element of the control stack.
     * 
     * @returns The top element of the control stack.
     */
    public pop(): object {
        return this.control.pop();
    }

    /**
     * Pushes a new element onto the control stack.
     * 
     * @param cmd The element to push onto the control stack.
     */
    public push(cmd: object): void {
        this.control.push(cmd);
    }

    /**
     * Peeks at the top element of the control stack.
     * 
     * @returns The top element of the control stack.
     */
    public peek(): object {
        return this.control[this.control.length - 1];
    }

    /**
     * Returns the length of the control stack.
     * 
     * @returns The length of the control stack.
     */
    public length(): number {
        return this.control.length;
    }
}

export { Control };
