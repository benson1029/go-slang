/**
 * CONTEXT_thread
 * Fields    : number of children, thread_id
 * Children  :
 * - address of the control (CONTEXT_control)
 * - address of the stash (CONTEXT_stash)
 * - address of the environment (CONTEXT_env)
 */

import { Heap } from "../../heap";
import { HeapObject } from "../objects";
import { TAG_CONTEXT_thread } from "../tags";
import { ContextControl } from "./control";
import { ContextEnv } from "./env";
import { ContextStash } from "./stash";
import { ContextWaker } from "./waker";

class ContextThread extends HeapObject {
  private static thread_id_counter = 0;

  public static reset_thread_id_counter(): void {
    this.thread_id_counter = 0;
  }

  private static generate_thread_id(): number {
    this.thread_id_counter += 1;
    return this.thread_id_counter;
  }

  public control(): ContextControl {
    if (this.get_tag() !== TAG_CONTEXT_thread) {
      throw new Error("ContextThread.control: Invalid tag");
    }
    return new ContextControl(this.heap, this.get_child(0));
  }

  public stash(): ContextStash {
    if (this.get_tag() !== TAG_CONTEXT_thread) {
      throw new Error("ContextThread.stash: Invalid tag");
    }
    return new ContextStash(this.heap, this.get_child(1));
  }

  public env(): ContextEnv {
    if (this.get_tag() !== TAG_CONTEXT_thread) {
      throw new Error("ContextThread.env: Invalid tag");
    }
    return new ContextEnv(this.heap, this.get_child(2));
  }

  public thread_id(): number {
    if (this.get_tag() !== TAG_CONTEXT_thread) {
      throw new Error("ContextThread.thread_id: Invalid tag");
    }
    return this.get_field(1);
  }

  public fork(): ContextThread {
    if (this.get_tag() !== TAG_CONTEXT_thread) {
      throw new Error("ContextThread.fork: Invalid tag");
    }

    const forked_address = this.heap.allocate_object(TAG_CONTEXT_thread, 2, 3);
    this.heap.set_cannnot_be_freed(forked_address, true);
    this.heap.set_field(forked_address, 1, ContextThread.generate_thread_id());

    const control = this.control().copy();
    this.heap.set_child(forked_address, 0, control.address);

    const stash = this.stash().copy();
    this.heap.set_child(forked_address, 1, stash.address);

    const env = this.env().copy();
    this.heap.set_child(forked_address, 2, env.address);

    this.heap.set_cannnot_be_freed(forked_address, false);
    return new ContextThread(this.heap, forked_address);
  }

  public createWaker(): ContextWaker {
    if (this.get_tag() !== TAG_CONTEXT_thread) {
      throw new Error("ContextThread.createWaker: Invalid tag");
    }

    const w = ContextWaker.allocate(this.heap, this);
    return new ContextWaker(this.heap, w);
  }

  public static allocate(heap: Heap): number {
    const address = heap.allocate_object(TAG_CONTEXT_thread, 2, 3);
    heap.set_cannnot_be_freed(address, true);
    heap.set_field(address, 1, this.generate_thread_id());

    const control = ContextControl.allocate(heap);
    heap.set_child(address, 0, control);

    const stash = ContextStash.allocate(heap);
    heap.set_child(address, 1, stash);

    const env = ContextEnv.allocate(heap);
    heap.set_child(address, 2, env);

    heap.set_cannnot_be_freed(address, false);
    return address;
  }

  public stringify_i(): string {
    let result = "";
    result += this.address.toString() + " (thread): ";
    result += "C[";
    result += this.control().stringify();
    result += "], S[";
    result += this.stash().stringify();
    result += "], E[";
    result += this.env().stringify();
    result += "]";
    return result;
  }
}

export { ContextThread };
