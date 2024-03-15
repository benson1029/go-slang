import { Heap } from "../heap";
import { Control } from "./control";
import { Stash } from "./stash";
import { Env, create_global_environment } from "./env";
import { lookup_microcode } from "./microcode";
import { auto_cast } from "../heap/types/auto_cast";
import { Primitive } from "../heap/types/primitive";
// import { load } from "./loader";

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
        // Initialize the control, stash and environment.
        this.C = new Control();
        this.S = new Stash();
        this.E = create_global_environment(this.heap, this.program.imports);

        // load(this.program, this.C, this.S, this.E, this.heap)
        // Stub for loading the main function directly:
        let main = this.program.body.filter((x: any) => x.tag === "function" && x.name === "main")[0];
        const main_addr = this.heap.allocate_any(main.body.body)
        this.C.push(main_addr)

        // Evaluate the program.
        while (true) {
            if (this.C.length() === 0) {
                break;
            }

            const cmd = this.C.pop();
            const microcode = lookup_microcode(this.heap.get_tag(cmd));
            console.log(cmd, microcode.name);
            microcode(cmd, this.heap, this.C, this.S, this.E);
            //this.heap.free_object(cmd);
        }

        const result = auto_cast(this.heap, this.S.pop()) as unknown as Primitive;
        return result.get_value();
    }
}

export { ECE };
