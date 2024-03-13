/**
 * COMPLEX_linked_list
 * Structure : [4 bytes metadata, 4 bytes reference count]
 * Fields    : number of children
 * Children  :
 * - value (any)
 * - next_address node (COMPLEX_linked_list)
 *
 * @param values linked list values
 * @returns address of the object
 */

import { Heap } from "../../heap";
import { auto_cast } from "../auto_cast";
import { HeapObject } from "../objects";
import { PrimitiveNil } from "../primitive/nil";
import { TAG_COMPLEX_linked_list } from "../tags";

class ComplexLinkedList extends HeapObject {
  public get_value_address(): HeapObject {
    return auto_cast(this.heap, this.get_child(0));
  }

  public get_next_address(): PrimitiveNil | ComplexLinkedList {
    return auto_cast(this.heap, this.get_child(1)) as PrimitiveNil | ComplexLinkedList;
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
