import { Heap } from "../heap";
import { lookup_microcode } from "./microcode";
import { load } from "./loader";
import { ContextThread } from "../heap/types/context/thread";
import { link_imports } from "./microcode/builtin";
import { ContextScheduler } from "../heap/types/context/scheduler";

/**
 * Represents the main logic of the Explicit Control Evaluator.
 */
class ECE {
  private memory: number;
  private heap: Heap;

  private program: any;

  private visualize: boolean;
  private snapshots: any[] = [];

  /**
   * Creates a new instance of the ECE.
   *
   * @param memory The amount of memory to allocate for the heap.
   */
  constructor(memory: number, program: any, visualize: boolean = false) {
    this.memory = memory;
    this.heap = new Heap(this.memory);
    this.program = JSON.parse(JSON.stringify(program)); // Deep copy `program`
    this.visualize = visualize;
  }

  private startup_thread(): ContextThread {
    ContextThread.reset_thread_id_counter();

    // Initialize the control, stash and environment.
    let thread = new ContextThread(
      this.heap,
      ContextThread.allocate(this.heap)
    );

    let C = thread.control();
    let S = thread.stash();
    let E = thread.env();

    // Link imports
    let imports = link_imports("default");
    for (let imp of this.program.imports) {
      imports = imports.concat(link_imports(imp));
    }
    E.create_global_environment(imports);
    load(this.program, C, S, E, this.heap, imports);

    return thread;
  }

  public evaluate(check_all_free: boolean = false, check_mark_and_sweep = false): { output: string; snapshots: any[] } {
    this.heap.set_check_mark_and_sweep(check_mark_and_sweep);

    // Create the scheduler.
    const scheduler = new ContextScheduler(
      this.heap,
      ContextScheduler.allocate(this.heap)
    );
    this.heap.set_root(0, scheduler.address);
    this.heap.clear_intermediate();

    // Keep a copy of the main thread.
    const main_thread = this.startup_thread();
    this.heap.set_root(1, main_thread.address);
    scheduler.enqueue(main_thread);
    this.heap.clear_intermediate();

    // Create output buffer
    let output_buffer = ``;
    let output = (thread_id: number) => (value: any) => {
      output_buffer += value;
      // output_buffer += `${thread_id}: ${value}\n`;
    };

    // Evaluate the program.
    while (!main_thread.control().empty()) {
      if (scheduler.empty()) {
        throw new Error(
          "All goroutines are asleep - deadlock!"
        );
      }
      if (this.visualize) {
        this.take_snapshot(scheduler);
      }
      const thread = scheduler.dequeue();
      if (!thread.control().empty()) {
        const cmd = thread.control().pop();
        const microcode = lookup_microcode(this.heap.get_tag(cmd));
        microcode(
          cmd,
          this.heap,
          thread,
          scheduler,
          output(thread.thread_id())
        );
        this.heap.free_object(cmd);
      }
      thread.free();
      this.heap.clear_intermediate();
    }
    if (this.visualize) {
      this.take_snapshot(scheduler);
    }
    scheduler.free();

    // console.log(S.stringify());
    // if (!S.empty()) {
    //   throw new Error("ECE.evaluate: Stash not empty after program execution");
    // }

    if (check_all_free) {
      if (main_thread.stash().empty() === false) {
        throw new Error(
          "ECE.evaluate: Stash not empty after program execution"
        );
      }
    }

    main_thread.free();

    if (check_all_free) {
      if (this.heap.check_all_free() === false) {
        throw new Error(
          "ECE.evaluate: Not all objects are freed after program execution"
        );
      }
    }

    if (check_mark_and_sweep) {
      this.heap.mark_and_sweep();
      if (this.heap.check_all_free() === false) {
        throw new Error(
          "ECE.evaluate: Not all objects are freed after program execution"
        );
      }
    }

    //console.log("Check all objects are freed:", this.heap.check_all_free());

    return {
      output: output_buffer,
      snapshots: this.snapshots,
    };
  }

  private take_snapshot(scheduler: ContextScheduler) {
    let snapshot = scheduler.to_object();
    const front_thread = scheduler.get_front_address().thread_id();
    snapshot.forEach((thread: any) => {
      thread.current = thread.id === front_thread;
    });
    this.snapshots.push(snapshot);
  }
}

export { ECE };
