import { Heap } from "../heap";
import { Control } from "./control";
import { Stash } from "./stash";
import { Env, create_global_environment } from "./env";
import { lookup_microcode } from "./microcode";

/**
 * Represents the main logic of the Explicit Control Evaluator.
 */
class ECE {
    private memory: number;
    private heap: Heap;

    private program: any;

    // The control, stash and environment.
    private C: Control;
    private S: Stash;
    private E: Env;

    /**
     * Creates a new instance of the ECE.
     * 
     * @param memory The amount of memory to allocate for the heap.
     */
    constructor(memory: number, program: any) {
        this.memory = memory;
        this.heap = new Heap(this.memory);
        this.program = program;
    }

    public evaluate() {
        // A placeholder to find the main function.
        let main = this.program.body.filter((x: any) => x.tag === "function" && x.name === "main")[0];
        // Initialize the control, stash and environment.
        this.C = new Control(main.body.body);
        this.S = new Stash();
        this.E = create_global_environment(this.heap, this.program.imports);

        // Evaluate the program.
        while (true) {
            if (this.C.length() === 0) {
                break;
            }

            const cmd = this.C.pop();
            const microcode = lookup_microcode(cmd);
            this.E = microcode(cmd, this.heap, this.C, this.S, this.E);
        }

        return this.S.pop();
    }
}

export { ECE };