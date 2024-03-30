import { Heap } from "../heap";
import { lookup_microcode } from "./microcode";
import { load } from "./loader";
import { ContextThread } from "../heap/types/context/thread";
import { get_default_imports, link_imports } from "./microcode/builtin";

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

  public evaluate(check_all_free: boolean = false) {
    // Initialize the control, stash and environment.
    let thread = new ContextThread(
      this.heap,
      ContextThread.allocate(this.heap)
    );

    this.heap.set_root(thread.address);

    let C = thread.control();
    let S = thread.stash();
    let E = thread.env();

    // Link imports
    let imports = []
    for (let imp of this.program.imports) {
      imports = imports.concat(link_imports(imp));
    }
    const default_imports = get_default_imports();
    E.create_global_environment(imports, default_imports);
    load(this.program, C, S, E, this.heap, imports, default_imports);

    // Create output buffer
    let output_buffer = ``
    let output = (value: any) => {
      output_buffer += value;
    }

    // Evaluate the program.
    while (!C.empty()) {
      const cmd = C.pop();
      const microcode = lookup_microcode(this.heap.get_tag(cmd));
      microcode(cmd, this.heap, C, S, E, output);
      this.heap.free_object(cmd);
    }

    // console.log(S.stringify());
    // if (!S.empty()) {
    //   throw new Error("ECE.evaluate: Stash not empty after program execution");
    // }

    if (check_all_free) {
      if (S.empty() === false) {
        throw new Error("ECE.evaluate: Stash not empty after program execution");
      }
    }

    thread.free();

    if (check_all_free) {
      if (this.heap.check_all_free() === false) {
        throw new Error("ECE.evaluate: Not all objects are freed after program execution");
      }
    }

    //console.log("Check all objects are freed:", this.heap.check_all_free());

    return output_buffer;
  }
}

export { ECE };
