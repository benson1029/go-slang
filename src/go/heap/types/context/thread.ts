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
    return new ContextControl(this.heap, this.get_child(0));
  }

  public stash(): ContextStash {
    return new ContextStash(this.heap, this.get_child(1));
  }

  public env(): ContextEnv {
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
}

export { ContextThread };
