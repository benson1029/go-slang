/**
 * CONTROL_assign_i
 * Children  :
 * - 4 bytes address of the name (MISC_constant_string)
 */

import { Heap } from "../../heap";
import { ComplexString } from "../complex/string";
import { HeapObject } from "../objects";
import { TAG_CONTROL_assign_i } from "../tags";

class ControlAssignI extends HeapObject {
  public get_name_address(): ComplexString {
    // Guarantee: name is not nil
    return new ComplexString(this.heap, this.get_child(0));
  }

  public get_name(): string {
    return this.get_name_address().get_string();
  }

  public static allocate(heap: Heap, name: ComplexString): number {
    const address = heap.allocate_object(TAG_CONTROL_assign_i, 1, 1);
    heap.set_child(address, 0, name.address);
    heap.set_cannnot_be_freed(address, false);

    return address;
  }
}

export { ControlAssignI };
