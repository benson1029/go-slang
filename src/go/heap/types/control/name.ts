/**
 * CONTROL_name
 * Fields    : number of children
 * Children  :
 * - 4 bytes address of the name (MISC_constant_string)
 */

import { Heap } from "../../heap";
import { ComplexString } from "../complex/string";
import { HeapObject } from "../objects";
import { TAG_CONTROL_name } from "../tags";

class ControlName extends HeapObject {
  public get_name_address(): ComplexString {
    // Guarantee: name is not nil
    return new ComplexString(this.heap, this.get_child(0));
  }

  public get_name(): string {
    return this.get_name_address().get_string();
  }

  public static allocate(heap: Heap, name: string): number {
    const address = heap.allocate_object(TAG_CONTROL_name, 1, 1);
    heap.set_cannnot_be_freed(address, true);

    const name_address = ComplexString.allocate(heap, name);
    heap.set_cannnot_be_freed(name_address, true);

    heap.set_child(address, 0, name_address);

    // Unmark cannot-be-free
    heap.set_cannnot_be_freed(address, false);
    heap.set_cannnot_be_freed(name_address, false);

    return address;
  }

  public stringify_i(): string {
    return this.address.toString() + " (name): " + this.get_name();
  }
}

export { ControlName };
