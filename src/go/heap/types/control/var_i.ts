/**
 * CONTROL_var_i
 * Children  :
 * - 4 bytes address of the name (MISC_constant_string)
 */

import { Heap } from "../../heap";
import { ComplexString } from "../complex/string";
import { HeapObject } from "../objects";
import { TAG_CONTROL_var_i } from "../tags";

class ControlVarI extends HeapObject {
  public get_name_address(): ComplexString {
    // Guarantee: name is not nil
    return new ComplexString(this.heap, this.get_child(0));
  }

  public get_name(): string {
    return this.get_name_address().get_string();
  }

  public static allocate(heap: Heap, name: ComplexString): number {
    const address = heap.allocate_object(TAG_CONTROL_var_i, 1, 1);
    heap.set_child(address, 0, name.reference().address);
    return address;
  }

  public stringify_i(): string {
    return this.address.toString() + " (var_i): " + this.get_name();
  }
  
  public to_object(): any {
    return "VAR_I " + this.get_name();
  }
}

export { ControlVarI };
