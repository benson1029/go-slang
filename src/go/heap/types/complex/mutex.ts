/**
 * COMPLEX_mutex
 * Fields    : number of children, whether the mutex is locked
 * Children  :
 * - address to a queue of CONTEXT_waker
 */

import { Heap } from "../../heap";
import { ContextScheduler } from "../context/scheduler";
import { ContextThread } from "../context/thread";
import { ContextWaker } from "../context/waker";
import { HeapObject } from "../objects";
import { TAG_COMPLEX_mutex } from "../tags";
import { ComplexQueue } from "./queue";

class ComplexMutex extends HeapObject {
  private get_queue(): ComplexQueue {
    return new ComplexQueue(this.heap, this.get_child(0));
  }

  private toggle_lock(): void {
    this.set_field(1, this.isLocked() ? 0 : 1);
  }

  public isLocked(): boolean {
    return this.get_field(1) === 1;
  }

  /**
   * Lock the mutex.
   * If the mutex is already locked, the thread is enqueued in the mutex's queue.
   * If the mutex is not locked, the mutex is locked and the thread is enqueued in the scheduler.
   *
   * This method will call reference() on the thread when enqueuing it in the queue.
   *
   * @param thread
   * @param scheduler
   */
  public lock(thread: ContextThread, scheduler: ContextScheduler): void {
    if (this.isLocked()) {
      const waker = thread.createWaker();
      this.get_queue().enqueue(waker);
      waker.free();
    } else {
      this.toggle_lock();
      scheduler.enqueue(thread);
    }
  }

  /**
   * Unlock the mutex.
   * If the mutex is not locked, an error is thrown.
   * If the mutex is locked, the mutex is unlocked and the first thread in the queue is dequeued and woken.
   * If the queue is empty, nothing happens.
   *
   * This method will call free() on the waker when dequeuing it from the queue.
   *
   * @param scheduler
   */
  public unlock(scheduler: ContextScheduler): void {
    if (!this.isLocked()) {
      throw new Error("Mutex is not locked");
    }
    this.toggle_lock();
    if (this.get_queue().length() > 0) {
      const waker = this.get_queue().dequeue() as ContextWaker;
      waker.wake(scheduler);
      waker.free();
    }
  }

  public static allocate(heap: Heap): number {
    const address = heap.allocate_object(TAG_COMPLEX_mutex, 2, 1);
    heap.set_field(address, 1, 0);
    heap.set_child(address, 0, ComplexQueue.allocate(heap));
    return address;
  }

  public stringify_i(): string {
    let result = "";
    result += this.address.toString();
    result += " mutex";
    result += " [";
    result += this.isLocked() ? " locked" : " unlocked";
    result += " queue: " + this.get_queue().stringify();
    result += "]";
    return result;
  }
}

export { ComplexMutex };
