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
import { TAG_COMPLEX_linked_list } from "../tags";

class ComplexLinkedList extends HeapObject {
  public get_value_address(): HeapObject {
    return auto_cast(this.heap, this.get_child(0));
  }

  public get_next_address(): ComplexLinkedList {
    return new ComplexLinkedList(this.heap, this.get_child(1));
  }

  /**
   * Important: This method calls free() on the current node.
   * @returns the next node
   */
  public insert_before(value: any): ComplexLinkedList {
    const new_address = ComplexLinkedList.allocate(this.heap, value, this.address);
    this.free();
    return new ComplexLinkedList(this.heap, new_address);
  }

  /**
   * Important: This method calls free() on the current node.
   * @returns the next node
   */
  public remove_current_node(): ComplexLinkedList {
    const next = this.get_next_address();
    this.free();
    return next;
  }

  public static allocate(heap: Heap, value: any, next_address: number): number {
    heap.set_cannnot_be_freed(next_address, true);

    const head = heap.allocate_object(TAG_COMPLEX_linked_list, 1, 2);
    heap.set_cannnot_be_freed(head, true);

    const head_value = heap.allocate_any(value);
    heap.set_cannnot_be_freed(head_value, true);

    heap.set_child(head, 0, head_value);
    heap.set_child(head, 1, heap.reference_object(next_address));

    // Unmark cannot-be-free
    heap.set_cannnot_be_freed(head, false);
    heap.set_cannnot_be_freed(head_value, false);
    heap.set_cannnot_be_freed(next_address, false);

    return head;
  }

  public static allocate_from_array(heap: Heap, values: any[]): number {
    if (values.length === 0) {
      return 0;
    }

    const head = heap.allocate_object(TAG_COMPLEX_linked_list, 1, 2);
    heap.set_cannnot_be_freed(head, true);

    const head_value = heap.allocate_any(values[0]);
    heap.set_cannnot_be_freed(head_value, true);

    heap.set_child(head, 0, head_value);

    let address = head;
    for (let i = 1; i < values.length; i++) {
      const next = heap.allocate_object(TAG_COMPLEX_linked_list, 1, 2);
      heap.set_cannnot_be_freed(next, true);

      const next_value = heap.allocate_any(values[i]);
      heap.set_cannnot_be_freed(next_value, true);

      heap.set_child(next, 0, next_value);
      heap.set_child(address, 1, next);

      address = next;
    }

    // Unmark cannot-be-free
    address = head;
    while (address !== 0) {
      const value = heap.get_child(address, 0);
      const next = heap.get_child(address, 1);
      heap.set_cannnot_be_freed(address, false);
      heap.set_cannnot_be_freed(value, false);
      address = next;
    }

    return head;
  }
}

export { ComplexLinkedList };
