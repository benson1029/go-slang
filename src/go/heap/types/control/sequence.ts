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

  public pop_front(): void {
    this.heap.mark_intermediate(this.get_linked_list_address().address);
    this.set_child(0, this.get_linked_list_address().pop_front().address);
  }

  public static allocate(heap: Heap, body: any[]): number {
    const address = heap.allocate_object(TAG_CONTROL_sequence, 1, 1);

    const linked_list_address = heap.allocate_COMPLEX_linked_list(body);
    heap.set_child(address, 0, linked_list_address);

    return address;
  }

  public stringify_i(): string {
    return this.address.toString() + " (sequence): " + this.get_linked_list_address().stringify();
  }

  public to_object(): any {
    let seq = this.get_linked_list_address().to_object();
    return seq.map(str => str + ";").join(" ");
  }
}

export { ControlSequence };
