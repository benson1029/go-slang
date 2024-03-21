/**
 * CONTEXT_thread
 * Fields    : number of children
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

class ContextThread extends HeapObject {
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

  public static allocate(heap: Heap): number {
    const address = heap.allocate_object(TAG_CONTEXT_thread, 1, 3);
    heap.set_cannnot_be_freed(address, true);

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
