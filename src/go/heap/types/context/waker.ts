/**
 * CONTEXT_waker
 * Fields    : number of children
 * Children  :
 * - address to a sleeping thread
 */

import { Heap } from "../../heap";
import { HeapObject } from "../objects";
import { PrimitiveNil } from "../primitive/nil";
import { TAG_CONTEXT_waker } from "../tags";
import { ContextScheduler } from "./scheduler";
import { ContextThread } from "./thread";

class ContextWaker extends HeapObject {
  public isEmpty(): boolean {
    return this.get_child(0) === PrimitiveNil.allocate();
  }

  public get_thread(): ContextThread {
    return new ContextThread(this.heap, this.get_child(0));
  }

  /**
   * @param scheduler
   * @returns whether a thread was woken
   */
  public wake(scheduler: ContextScheduler): boolean {
    const thread = new ContextThread(this.heap, this.get_child(0));
    if (!thread.is_nil()) {
      this.set_child(0, PrimitiveNil.allocate());
      scheduler.enqueue(thread);
      thread.free();
      return true;
    }
    return false;
  }

  public static allocate(heap: Heap, thread: ContextThread): number {
    const address = heap.allocate_object(TAG_CONTEXT_waker, 1, 1);
    heap.set_child(address, 0, thread.reference().address);
    return address;
  }

  public stringify_i(): string {
    let result = "";
    result += this.address.toString(16);
    result += " (waker) -> ";
    result += new ContextThread(this.heap, this.get_child(0))
      .thread_id()
      .toString();
    return result;
  }
}

export { ContextWaker };
