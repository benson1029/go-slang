/**
 * COMPLEX_semaphore
 * Fields    : number of children, number of permits
 * Children  :
 * - address to a queue of CONTEXT_waker
 */

import { Heap } from "../../heap";
import { ContextScheduler } from "../context/scheduler";
import { ContextThread } from "../context/thread";
import { ContextWaker } from "../context/waker";
import { HeapObject } from "../objects";
import { TAG_COMPLEX_semaphore } from "../tags";
import { ComplexQueue } from "./queue";

class ComplexSemaphore extends HeapObject {
  private get_queue(): ComplexQueue {
    return new ComplexQueue(this.heap, this.get_child(0));
  }

  public get_permits(): number {
    return this.get_field(1);
  }

  private increment_permits(): void {
    this.set_field(1, this.get_permits() + 1);
  }

  private decrement_permits(): void {
    this.set_field(1, this.get_permits() - 1);
  }

  /**
   * Lock the semaphore.
   *
   * This method will call reference() on the thread when enqueuing it in the queue.
   *
   * @param thread
   * @param scheduler
   */
  public lock(thread: ContextThread, scheduler: ContextScheduler): boolean {
    this.decrement_permits();
    if (this.get_permits() < 0) {
      const waker_address = ContextWaker.allocate(this.heap, thread);
      const waker = new ContextWaker(this.heap, waker_address);
      this.get_queue().enqueue(waker);
      waker.free();
      return false;
    } else {
      scheduler.enqueue(thread);
      return true;
    }
  }

  /**
   * Unlock the semaphore.
   *
   * This method will call free() on the waker when dequeuing it from the queue.
   *
   * @param scheduler
   */
  public unlock(scheduler: ContextScheduler): void {
    this.increment_permits();
    if (this.get_permits() <= 0) {
      if (this.get_queue().length() === 0) {
        throw new Error("Wrong Implementation: Semaphore is not locked");
      }
      const waker = this.get_queue().dequeue() as ContextWaker;
      waker.wake(scheduler);
    }
  }

  public static allocate(heap: Heap, permits: number): number {
    const address = heap.allocate_object(TAG_COMPLEX_semaphore, 2, 1);
    heap.set_field(address, 1, permits);
    heap.set_child(address, 0, ComplexQueue.allocate(heap));
    return address;
  }

  public stringify_i(): string {
    let result = "";
    result += this.address.toString();
    result += " semaphore";
    result += " [";
    result += this.get_permits();
    result += "]";
    return result;
  }
}

export { ComplexSemaphore };
