import { Heap } from "../heap";
import { lookup_microcode } from "./microcode";
import { auto_cast } from "../heap/types/auto_cast";
import { Primitive } from "../heap/types/primitive";
import { load } from "./loader";
import { ContextThread } from "../heap/types/context/thread";

/**
 * Represents the main logic of the Explicit Control Evaluator.
 */
class ECE {
  private memory: number;
  private heap: Heap;

  private program: any;

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
    let thread = new ContextThread(
      this.heap,
      ContextThread.allocate(this.heap)
    );

    this.heap.set_root(thread.address);

    let C = thread.control();
    let S = thread.stash();
    let E = thread.env();

    E.create_global_environment(this.program.imports);
    load(this.program, C, S, E, this.heap);

    // Evaluate the program.
    while (true) {
      if (C.length() === 0) {
        break;
      }

      const cmd = C.pop();
      const microcode = lookup_microcode(this.heap.get_tag(cmd));
      microcode(cmd, this.heap, C, S, E);
      this.heap.free_object(cmd);
    }

    const result = auto_cast(this.heap, S.pop()) as unknown as Primitive;
    return result.get_value();
  }
}

export { ECE };
