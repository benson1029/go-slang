/**
 * USER_channel
 * Fields    : number of children, buffer size, whether channel is closed
 * Children  :
 * - address of the buffer queue of values (COMPLEX_queue)
 * - address of the queue of waiting senders (COMPLEX_queue of CONTEXT_waker)
 * - address of the queue of waiting receivers (COMPLEX_queue of CONTEXT_waker)
 * - address of the type of the channel (USER_type)
 */

import { Heap } from "../../heap";
import { auto_cast } from "../auto_cast";
import { TAG_USER_channel } from "../tags";
import { ComplexQueue } from "../complex/queue";
import { UserVariable } from "./variable";
import { HeapObject } from "../objects";
import { UserType } from "./type";
import { PrimitiveNil } from "../primitive/nil";
import { ContextWaker } from "../context/waker";
import { ContextThread } from "../context/thread";
import { ContextScheduler } from "../context/scheduler";

const IS_OPEN = 0;
const IS_CLOSED = 1;

class UserChannel extends HeapObject {
  private get_buffer_size(): number {
    return this.get_field(1);
  }

  private isClosed(): boolean {
    return this.get_field(2) === IS_CLOSED;
  }

  private buffer(): ComplexQueue {
    return new ComplexQueue(this.heap, this.get_child(0));
  }

  private waitingSend(): ComplexQueue {
    return new ComplexQueue(this.heap, this.get_child(1));
  }

  private waitingRecv(): ComplexQueue {
    return new ComplexQueue(this.heap, this.get_child(2));
  }

  private get_type(): UserType {
    return auto_cast(this.heap, this.get_child(3)) as UserType;
  }

  private zero(): UserVariable {
    return new UserVariable(
      this.heap,
      UserVariable.allocate(
        this.heap,
        this.get_type(),
        PrimitiveNil.allocate_default(this.heap)
      )
    );
  }

  public close(): void {
    if (this.isClosed()) {
      throw new Error("UserChannel.close: channel is already closed");
    }
    this.set_field(2, IS_CLOSED);
  }

  public try_send(
    thread: ContextThread,
    scheduler: ContextScheduler,
    value: UserVariable
  ): { success: boolean; waitingQueue: ComplexQueue } {
    if (this.isClosed()) {
      throw new Error("UserChannel.try_send: channel is closed");
    }

    if (this.buffer().length() < this.get_buffer_size()) {
      this.buffer().enqueue(value);

      while (this.waitingRecv().length() > 0) {
        const waiting = this.waitingRecv().dequeue() as ContextWaker;
        if (waiting.isEmpty()) {
          waiting.free();
          continue;
        }

        const new_value = this.buffer().dequeue() as UserVariable; // Guaranteed to be non-empty
        waiting.get_thread().stash().push(new_value.address);

        waiting.wake(scheduler);

        new_value.free();
        waiting.free();
        break;
      }

      return { success: true, waitingQueue: null };
    } else {
      return { success: false, waitingQueue: this.waitingSend() };
    }
  }

  public send(
    thread: ContextThread,
    scheduler: ContextScheduler,
    value: UserVariable
  ): void {
    if (this.isClosed()) {
      throw new Error("UserChannel.send: channel is closed");
    }
    const result = this.try_send(thread, scheduler, value);
    if (result.success) {
      scheduler.enqueue(thread);
    } else {
      thread.stash().push(value.address);
      const waker = thread.createWaker();
      result.waitingQueue.enqueue(waker);
      waker.free();
      // we don't enqueue the thread, because it needs to wait
    }
  }

  /**
   * Note: the received value is stored in the thread's stash, if successful.
   *
   * @param thread
   * @param scheduler
   * @returns
   */
  public try_recv(
    thread: ContextThread,
    scheduler: ContextScheduler
  ): { success: boolean; waitingQueue: ComplexQueue } {
    if (this.buffer().length() > 0) {
      const value = this.buffer().dequeue() as UserVariable;
      thread.stash().push(value.address);
      value.free();

      while (this.waitingSend().length() > 0) {
        const waiting = this.waitingSend().dequeue() as ContextWaker;
        if (waiting.isEmpty()) {
          waiting.free();
          continue;
        }

        const new_value_address = waiting.get_thread().stash().pop();
        const new_value = new UserVariable(this.heap, new_value_address);
        this.buffer().enqueue(new_value);

        waiting.wake(scheduler);

        new_value.free();
        waiting.free();
        break;
      }

      return { success: true, waitingQueue: null };
    } else {
      if (this.isClosed()) {
        const zero = this.zero();
        thread.stash().push(zero.address);
        zero.free();
        return { success: true, waitingQueue: null };
      }
      return { success: false, waitingQueue: this.waitingRecv() };
    }
  }

  public recv(thread: ContextThread, scheduler: ContextScheduler): void {
    const result = this.try_recv(thread, scheduler);
    if (result.success) {
      scheduler.enqueue(thread);
    } else {
      const waker = thread.createWaker();
      result.waitingQueue.enqueue(waker);
      waker.free();
      // we don't enqueue the thread, because it needs to wait
    }
  }

  public static allocate(
    heap: Heap,
    buffer_size: number,
    type: UserType
  ): number {
    const address = heap.allocate_object(TAG_USER_channel, 3, 4);
    heap.set_field(address, 1, buffer_size);
    heap.set_field(address, 2, IS_OPEN);
    heap.set_child(address, 0, ComplexQueue.allocate(heap));
    heap.set_child(address, 1, ComplexQueue.allocate(heap));
    heap.set_child(address, 2, ComplexQueue.allocate(heap));
    heap.set_child(address, 3, type.reference().address);
    return address;
  }

  public stringify_i(): string {
    let result = "";
    result += this.address.toString() + " ";

    return result;
  }
}

export { UserChannel };
