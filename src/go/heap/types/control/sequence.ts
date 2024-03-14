/**
 * CONTROL_sequence
 * Fields    : number of children
 * Children  : address of linked list of expressions in body
 */

import { Heap } from "../../heap";
import { ComplexLinkedList } from "../complex/linked_list";
import { HeapObject } from "../objects";
import { TAG_CONTROL_sequence } from "../tags";

class ControlSequence extends HeapObject {
  public get_linked_list_address(): ComplexLinkedList {
    return new ComplexLinkedList(this.heap, this.get_child(0));
  }

  public remove_first_linked_list_element(): void {
    this.set_child(0, this.get_linked_list_address().remove_current_node().address);
  }

  public static allocate(heap: Heap, body: any[]): number {
    const address = heap.allocate_object(TAG_CONTROL_sequence, 1, 1);
    heap.set_cannnot_be_freed(address, true);

    const linked_list_address = heap.allocate_COMPLEX_linked_list(body);

    heap.set_child(address, 0, linked_list_address);
    heap.set_cannnot_be_freed(address, false);

    return address;
  }
}

export { ControlSequence };
