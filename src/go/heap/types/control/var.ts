/**
 * CONTROL_var
 * Children  :
 * - 4 bytes address of the name (MISC_constant_string)
 * - 4 bytes address of the value (expression)
 */

import { Heap } from "../../heap";
import { auto_cast } from "../auto_cast";
import { ComplexString } from "../complex/string";
import { HeapObject } from "../objects";
import { TAG_CONTROL_var } from "../tags";

class ControlVar extends HeapObject {
  public get_name_address(): ComplexString {
    // Guarantee: name is not nil
    return new ComplexString(this.heap, this.get_child(0));
  }

  public get_name(): string {
    return this.get_name_address().get_string();
  }

  public get_expression_address(): number {
    return this.get_child(1);
  }

  public get_expression(): HeapObject {
    return auto_cast(this.heap, this.get_expression_address());
  }

  public static allocate(heap: Heap, name: string, value: any): number {
    const address = heap.allocate_object(TAG_CONTROL_var, 1, 2);
    heap.set_cannnot_be_freed(address, true);

    const name_address = ComplexString.allocate(heap, name);
    heap.set_cannnot_be_freed(name_address, true);

    const value_address = heap.allocate_any(value);
    heap.set_cannnot_be_freed(value_address, true);

    heap.set_child(address, 0, name_address);
    heap.set_child(address, 1, value_address);

    // Unmark cannot-be-free
    heap.set_cannnot_be_freed(address, false);
    heap.set_cannnot_be_freed(name_address, false);
    heap.set_cannnot_be_freed(value_address, false);

    return address;
  }
}

export { ControlVar };
