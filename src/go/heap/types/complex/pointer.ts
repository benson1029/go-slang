/**
 * COMPLEX_pointer
 * Fields    : number of children
 * Children  : address of the object referenced
 */

import { Heap } from "../../heap";
import { auto_cast } from "../auto_cast";
import { HeapObject } from "../objects";
import { TAG_COMPLEX_pointer } from "../tags";

class ComplexPointer extends HeapObject {
  public get_value(): HeapObject {
    return auto_cast(this.heap, this.get_child(0));
  }

  public static allocate(heap: Heap, value: number): number {
    const address = heap.allocate_object(TAG_COMPLEX_pointer, 1, 1);
    const value_address = new HeapObject(heap, value).reference();
    heap.set_child(address, 0, value_address.address);
    return address;
  }

  public stringify_i(): string {
    return this.address.toString() + " (pointer): " + this.get_value().stringify();
  }
}

export { ComplexPointer };
