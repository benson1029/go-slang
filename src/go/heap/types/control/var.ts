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

    const name_address = ComplexString.allocate(heap, name);
    heap.set_child(address, 0, name_address);

    const value_address = heap.allocate_any(value);
    heap.set_child(address, 1, value_address);

    return address;
  }

  public stringify_i(): string {
    return this.address.toString() + " (var): " + this.get_name() + " = " + this.get_expression().stringify();
  }

  public to_object(): any {
    return this.get_name() + " := " + this.get_expression().to_object();
  }
}

export { ControlVar };
