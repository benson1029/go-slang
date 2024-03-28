/**
 * COMPLEX_queue
 * Fields    : size of the queue
 * Children  :
 * - front address (COMPLEX_linked_list)
 * - back address (COMPLEX_linked_list)
 */

import { Heap } from "../../heap";
import { HeapObject } from "../objects";
import { PrimitiveNil } from "../primitive/nil";
import { TAG_COMPLEX_queue } from "../tags";
import { ComplexLinkedList } from "./linked_list";

class ComplexQueue extends HeapObject {
  public length(): number {
    if (this.get_tag() !== TAG_COMPLEX_queue) {
      throw new Error("ComplexQueue.length: Invalid tag");
    }
    return this.get_field(1);
  }

  private increment_length(): void {
    if (this.get_tag() !== TAG_COMPLEX_queue) {
      throw new Error("ComplexQueue.increment_length: Invalid tag");
    }
    this.set_field(1, this.length() + 1);
  }

  private decrement_length(): void {
    if (this.get_tag() !== TAG_COMPLEX_queue) {
      throw new Error("ComplexQueue.decrement_length: Invalid tag");
    }
    this.set_field(1, this.length() - 1);
  }

  private front_linked_list(): ComplexLinkedList {
    if (this.get_tag() !== TAG_COMPLEX_queue) {
      throw new Error("ComplexQueue.front_linked_list: Invalid tag");
    }
    return new ComplexLinkedList(this.heap, this.get_child(0));
  }

  private back_linked_list(): ComplexLinkedList {
    if (this.get_tag() !== TAG_COMPLEX_queue) {
      throw new Error("ComplexQueue.back_linked_list: Invalid tag");
    }
    return new ComplexLinkedList(this.heap, this.get_child(1));
  }

  /**
   * Important: This method does not call reference() on the value.
   * @returns front value
   */
  public front(): HeapObject {
    if (this.get_tag() !== TAG_COMPLEX_queue) {
      throw new Error("ComplexQueue.get_front_address: Invalid tag");
    }
    if (this.length() === 0) {
      throw new Error("ComplexQueue.get_front_address: Empty queue");
    }
    return this.front_linked_list().get_value_address();
  }

  /**
   * Important: This method does not call reference() on the value.
   * @returns back value
   */
  public back(): HeapObject {
    if (this.get_tag() !== TAG_COMPLEX_queue) {
      throw new Error("ComplexQueue.get_back_address: Invalid tag");
    }
    if (this.length() === 0) {
      throw new Error("ComplexQueue.get_back_address: Empty queue");
    }
    return this.back_linked_list().get_value_address();
  }

  /**
   * Important: This method will call reference() on the value.
   * @param value
   */
  public enqueue(value: HeapObject): void {
    if (this.get_tag() !== TAG_COMPLEX_queue) {
      throw new Error("ComplexQueue.enqueue: Invalid tag");
    }

    const new_back_address = ComplexLinkedList.allocate(
      this.heap,
      value.address,
      PrimitiveNil.allocate()
    );
    const new_back = new ComplexLinkedList(this.heap, new_back_address);

    if (this.length() === 0) {
      this.set_child(0, new_back.reference().address);
      this.set_child(1, new_back.reference().address);
    } else {
      const old_back = this.back_linked_list();
      old_back.set_next_address(new_back);
      this.set_child(1, new_back.reference().address);
      old_back.free();
    }

    this.increment_length();
    new_back.free();
  }

  /**
   * Important: This method will return a reference() to the value
   * (it does not decrease the reference count of the value).
   */
  public dequeue(): HeapObject {
    if (this.get_tag() !== TAG_COMPLEX_queue) {
      throw new Error("ComplexQueue.dequeue: Invalid tag");
    }
    if (this.length() === 0) {
      throw new Error("ComplexQueue.dequeue: Empty queue");
    }

    const value = this.front().reference();
    this.set_child(0, this.front_linked_list().remove_current_node().address);
    this.decrement_length();

    if (this.length() === 0) {
      this.set_child(1, PrimitiveNil.allocate());
    }

    return value;
  }

  public static allocate(heap: Heap): number {
    const address = heap.allocate_object(TAG_COMPLEX_queue, 2, 2);
    heap.set_field(address, 1, 0);
    heap.set_child(address, 0, PrimitiveNil.allocate());
    heap.set_child(address, 1, PrimitiveNil.allocate());
    return address;
  }

  public stringify_i(): string {
    let result = "";
    result += this.address.toString() + " (queue): ";
    result += "[";
    let front = this.front_linked_list();
    for (let i = 0; i < this.length(); i++) {
      result += front.get_value_address().stringify();
      if (i < this.length() - 1) {
        result += ", ";
      }
      front = front.get_next_address();
    }
    return result;
  }
}

export { ComplexQueue };
