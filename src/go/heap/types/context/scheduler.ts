/**
 * CONTEXT_scheduler
 * Fields    : number of children
 * Children  :
 * - address to a queue of threads (COMPLEX_queue)
 */

import { Heap } from "../../heap";
import { ComplexQueue } from "../complex/queue";
import { HeapObject } from "../objects";
import { TAG_CONTEXT_scheduler } from "../tags";
import { ContextThread } from "./thread";

class ContextScheduler extends HeapObject {
  private get_queue_address(): ComplexQueue {
    return new ComplexQueue(this.heap, this.get_child(0));
  }

  /**
   * Important: This method will return a reference() to the value
   * (it does not decrease the reference count of the value).
   */
  public dequeue(): ContextThread {
    const thread = this.get_queue_address().dequeue() as ContextThread;
    this.heap.mark_intermediate(thread.address);
    return thread;
  }

  /**
   * Important: This method calls reference() on the value.
   */
  public enqueue(thread: ContextThread): void {
    this.get_queue_address().enqueue(thread);
  }

  public get_front_address(): ContextThread {
    return this.get_queue_address().front() as ContextThread;
  }

  public empty(): boolean {
    return this.get_queue_address().length() === 0;
  }

  public static allocate(heap: Heap): number {
    const address = heap.allocate_object(TAG_CONTEXT_scheduler, 1, 1);
    const queue_address = ComplexQueue.allocate(heap);
    heap.set_child(address, 0, queue_address);
    return address;
  }

  public stringify_i(): string {
    let result = "";
    result += this.address.toString() + " (thread): ";
    result += "Q[";
    result += this.get_queue_address().stringify();
    result += "]";
    return result;
  }

  public to_object(): any {
    return this.get_queue_address().to_object().sort((a: any, b: any) => a.id - b.id);
  }
}

export { ContextScheduler };
