/**
 * USER_channel
 * Fields    : number of children, buffer size, whether channel is closed
 * Children  :
 * - address of the buffer queue of values (COMPLEX_queue)
 * - address of the queue of waiting senders (COMPLEX_queue of CONTEXT_waiting_instance)
 * - address of the queue of waiting receivers (COMPLEX_queue of CONTEXT_waiting_instance)
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
import { ContextThread } from "../context/thread";
import { ContextScheduler } from "../context/scheduler";
import { ContextWaitingInstance } from "../context/waiting_instance";

const IS_OPEN = 0;
const IS_CLOSED = 1;

class UserChannel extends HeapObject {
  private get_buffer_size(): number {
    if (this.get_tag() !== TAG_USER_channel) {
      throw new Error("UserChannel.get_buffer_size: invalid object tag");
    }
    return this.get_field(1);
  }

  private isClosed(): boolean {
    if (this.get_tag() !== TAG_USER_channel) {
      throw new Error("UserChannel.get_buffer_size: invalid object tag");
    }
    return this.get_field(2) === IS_CLOSED;
  }

  private buffer(): ComplexQueue {
    if (this.get_tag() !== TAG_USER_channel) {
      throw new Error("UserChannel.get_buffer_size: invalid object tag");
    }
    return new ComplexQueue(this.heap, this.get_child(0));
  }

  private waitingSend(): ComplexQueue {
    if (this.get_tag() !== TAG_USER_channel) {
      throw new Error("UserChannel.get_buffer_size: invalid object tag");
    }
    return new ComplexQueue(this.heap, this.get_child(1));
  }

  private waitingRecv(): ComplexQueue {
    if (this.get_tag() !== TAG_USER_channel) {
      throw new Error("UserChannel.get_buffer_size: invalid object tag");
    }
    return new ComplexQueue(this.heap, this.get_child(2));
  }

  private get_type(): UserType {
    if (this.get_tag() !== TAG_USER_channel) {
      throw new Error("UserChannel.get_buffer_size: invalid object tag");
    }
    return auto_cast(this.heap, this.get_child(3)) as UserType;
  }

  private zero(): HeapObject {
    if (this.get_tag() !== TAG_USER_channel) {
      throw new Error("UserChannel.get_buffer_size: invalid object tag");
    }
    const variable = new UserVariable(
      this.heap,
      UserVariable.allocate(
        this.heap,
        this.get_type(),
        PrimitiveNil.allocate_default(this.heap)
      )
    );
    const zero = variable.get_value().reference();
    variable.free();
    return zero;
  }

  public close(): void {
    if (this.get_tag() !== TAG_USER_channel) {
      throw new Error("UserChannel.get_buffer_size: invalid object tag");
    }
    if (this.isClosed()) {
      throw new Error("UserChannel.close: channel is already closed");
    }
    this.set_field(2, IS_CLOSED);
  }

  public try_send(
    thread: ContextThread,
    scheduler: ContextScheduler,
    value: HeapObject
  ): { success: boolean; waitingQueue: ComplexQueue } {
    if (this.get_tag() !== TAG_USER_channel) {
      throw new Error("UserChannel.get_buffer_size: invalid object tag");
    }
    if (this.isClosed()) {
      throw new Error("UserChannel.try_send: channel is closed");
    }

    while (this.waitingRecv().length() > 0) {
      let waiting = this.waitingRecv().front() as ContextWaitingInstance;
      if (waiting.get_waker().isEmpty()) {
        waiting = this.waitingRecv().dequeue() as ContextWaitingInstance;
        waiting.free();
        continue;
      } else {
        break;
      }
    }

    if (
      this.buffer().length() < this.get_buffer_size() ||
      this.waitingRecv().length() > 0
    ) {
      this.buffer().enqueue(value);

      if (this.waitingRecv().length() > 0) {
        const waiting = this.waitingRecv().dequeue() as ContextWaitingInstance;
        if (waiting.get_waker().isEmpty()) {
          throw new Error(
            "UserChannel.try_send: waiting receiver should have a waker"
          );
        }

        const new_value = this.buffer().dequeue(); // Guaranteed to be non-empty
        waiting.get_waker().get_thread().stash().push(new_value.address);

        if (!waiting.get_body().is_nil()) {
          // For select case, push the case body to the thread's control stack
          waiting
            .get_waker()
            .get_thread()
            .control()
            .push(waiting.get_body().address);
        }

        waiting.get_waker().wake(scheduler);
        new_value.free();
        waiting.free();
      }

      return { success: true, waitingQueue: null };
    } else {
      return { success: false, waitingQueue: this.waitingSend() };
    }
  }

  public send(
    thread: ContextThread,
    scheduler: ContextScheduler,
    value: HeapObject,
    body: HeapObject
  ): void {
    if (this.get_tag() !== TAG_USER_channel) {
      throw new Error("UserChannel.get_buffer_size: invalid object tag");
    }
    if (this.isClosed()) {
      throw new Error("UserChannel.send: channel is closed");
    }
    const result = this.try_send(thread, scheduler, value);
    if (result.success) {
      scheduler.enqueue(thread);
    } else {
      const waker = thread.createWaker();
      const waiting_instance = new ContextWaitingInstance(
        this.heap,
        ContextWaitingInstance.allocate(this.heap, waker)
      );

      waiting_instance.set_value(value);
      waiting_instance.set_body(body);
      result.waitingQueue.enqueue(waiting_instance);

      waker.free();
      waiting_instance.free();
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
    if (this.get_tag() !== TAG_USER_channel) {
      throw new Error("UserChannel.get_buffer_size: invalid object tag");
    }

    while (this.waitingSend().length() > 0) {
      const waiting = this.waitingSend().dequeue() as ContextWaitingInstance;
      if (waiting.get_waker().isEmpty()) {
        waiting.free();
        continue;
      }

      const new_value = waiting.get_value();
      this.buffer().enqueue(new_value);

      if (!waiting.get_body().is_nil()) {
        // For select case, push the case body to the thread's control stack
        waiting
          .get_waker()
          .get_thread()
          .control()
          .push(waiting.get_body().address);
      }

      waiting.get_waker().wake(scheduler);
      waiting.free();
      break;
    }

    if (this.buffer().length() > 0) {
      const value = this.buffer().dequeue();
      thread.stash().push(value.address);
      value.free();
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

  public recv(
    thread: ContextThread,
    scheduler: ContextScheduler,
    body: HeapObject
  ): void {
    if (this.get_tag() !== TAG_USER_channel) {
      throw new Error("UserChannel.get_buffer_size: invalid object tag");
    }
    const result = this.try_recv(thread, scheduler);
    if (result.success) {
      scheduler.enqueue(thread);
    } else {
      const waker = thread.createWaker();
      const waiting_instance = new ContextWaitingInstance(
        this.heap,
        ContextWaitingInstance.allocate(this.heap, waker)
      );

      waiting_instance.set_body(body);
      result.waitingQueue.enqueue(waiting_instance);

      waker.free();
      waiting_instance.free();
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
    result += "channel ";
    result += this.get_buffer_size().toString() + " ";
    result += this.get_type().stringify() + " ";
    result += this.isClosed() ? "closed" : "open";
    return result;
  }

  public to_object(): any {
    const buffer = this.buffer().to_object();
    return "Channel [" + buffer.join(" ") + "]";
  }
}

export { UserChannel };
