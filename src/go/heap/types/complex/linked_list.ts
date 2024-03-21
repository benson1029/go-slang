/**
 * COMPLEX_linked_list
 * Fields    : number of children
 * Children  :
 * - value (any)
 * - next_address node (COMPLEX_linked_list)
 */

import { Heap } from "../../heap";
import { auto_cast } from "../auto_cast";
import { HeapObject } from "../objects";
import { PrimitiveNil } from "../primitive/nil";
import { TAG_COMPLEX_linked_list } from "../tags";

class ComplexLinkedList extends HeapObject {
  public get_value_address(): HeapObject {
    if (this.get_tag() !== TAG_COMPLEX_linked_list) {
      throw new Error("ComplexLinkedList.get_value_address: Invalid tag");
    }
    return auto_cast(this.heap, this.get_child(0));
  }

  public get_next_address(): ComplexLinkedList {
    if (this.get_tag() !== TAG_COMPLEX_linked_list) {
      throw new Error("ComplexLinkedList.get_next_address: Invalid tag");
    }
    return new ComplexLinkedList(this.heap, this.get_child(1));
  }

  /**
   * Important: This method calls free() on the current node,
   * and returns the next node (with reference count increased).
   * 
   * Note: this method also works even if this is nil.
   * 
   * @returns the next node
   */
  public insert_before(value_address: number): ComplexLinkedList {
    const new_address = ComplexLinkedList.allocate(this.heap, value_address, this.address);
    this.free();
    return new ComplexLinkedList(this.heap, new_address);
  }

  /**
   * Important: This method calls free() on the current node,
   * and returns the next node (with reference count increased).
   */
  public remove_current_node(): ComplexLinkedList {
    const next = this.get_next_address().reference() as ComplexLinkedList;
    this.free();
    return next;
  }

  private static allocate(heap: Heap, value_address: number, next_address: number): number {
    const value = auto_cast(heap, value_address);
    const next = auto_cast(heap, next_address);

    value.set_cannnot_be_freed(true);
    next.set_cannnot_be_freed(true);

    const head = heap.allocate_object(TAG_COMPLEX_linked_list, 1, 2);
    heap.set_child(head, 0, value.reference().address);
    heap.set_child(head, 1, next.reference().address);

    // Unmark cannot-be-free
    value.set_cannnot_be_freed(false);
    next.set_cannnot_be_freed(false);

    return head;
  }

  public static allocate_from_array(heap: Heap, values: any[]): number {
    if (values.length === 0) {
      return PrimitiveNil.allocate();
    }

    let head = PrimitiveNil.allocate();
    for (let i = values.length - 1; i >= 0; i--) {
      const value_address = heap.allocate_any(values[i]);
      const new_head = ComplexLinkedList.allocate(heap, value_address, head);
      heap.free_object(value_address);
      head = new_head;
    }

    return head;
  }

  public stringify_i(): string {
    let result = "";
    result += this.address.toString() + " (linked_list): ";
    result += "[";
    result += this.get_value_address().stringify();
    result += ", ";
    result += this.get_next_address().stringify();
    result += "]";
    return result;
  }
}

export { ComplexLinkedList };
