/**
 * USER_channel
 * Fields    : number of children, buffer size, whether channel is closed
 * Children  :
 * - address of the queue of the channel
 * - address of the semaphore of number of empty slots in the buffer
 * - address of the semaphore of number of filled slots in the buffer
 * - address of the type of the channel
 */

import { Heap } from "../../heap";
import { auto_cast } from "../auto_cast";
import { TAG_USER_channel } from "../tags";
import { ComplexQueue } from "../complex/queue";
import { ComplexSemaphore } from "../complex/semaphore";
import { UserVariable } from "./variable";
import { HeapObject } from "../objects";
import { UserType } from "./type";
import { PrimitiveNil } from "../primitive/nil";

const IS_OPEN = 0;
const IS_CLOSED = 1;

class UserChannel extends HeapObject {
  public get_buffer_size(): number {
    return this.get_field(1);
  }

  private get_queue(): ComplexQueue {
    return new ComplexQueue(this.heap, this.get_child(0));
  }

  private get_type(): UserType {
    return auto_cast(this.heap, this.get_child(3)) as UserType;
  }

  public semaphoreEmptySlots(): ComplexSemaphore {
    return new ComplexSemaphore(this.heap, this.get_child(1));
  }

  public semaphoreFilledSlots(): ComplexSemaphore {
    return new ComplexSemaphore(this.heap, this.get_child(2));
  }

  private isClosed(): boolean {
    return this.get_field(2) === IS_CLOSED;
  }

  public close(): void {
    if (this.isClosed()) {
      throw new Error("UserChannel.close: channel is already closed");
    }
    this.set_field(2, IS_CLOSED);
  }

  /**
   * Guarantee: buffer is not full
   * @param value
   */
  public send(value: UserVariable): void {
    if (this.isClosed()) {
      throw new Error("UserChannel.send: channel is closed");
    }
    if (this.get_queue().length() > this.get_buffer_size()) {
      throw new Error("UserChannel.send: buffer is full");
    }
    this.get_queue().enqueue(value);
  }

  /**
   * Guarantee: buffer is not empty
   * @param thread
   * @param scheduler
   */
  public receive(): UserVariable {
    if (this.get_queue().length() > 0) {
      return this.get_queue().dequeue() as UserVariable;
    }
    if (this.isClosed()) {
      const zero = UserVariable.allocate(
        this.heap,
        this.get_type(),
        PrimitiveNil.allocate_default(this.heap)
      );
      return new UserVariable(this.heap, zero);
    }
    throw new Error("UserChannel.receive: buffer is empty");
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
    heap.set_child(address, 1, ComplexSemaphore.allocate(heap, buffer_size));
    heap.set_child(address, 2, ComplexSemaphore.allocate(heap, 0));
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
