/**
 * CONTROL_logical_i
 * Fields    : number of children
 * Children  :
 * - 4 bytes address of the operator (PRIMITIVE_string)
 */

import { Heap } from "../../heap";
import { HeapObject } from "../objects";
import { ComplexString } from "../complex/string";
import { TAG_CONTROL_logical_i } from "../tags";

class ControlLogicalI extends HeapObject {
  public get_operator_address(): ComplexString {
    // Guarantee: operator is not nil
    return new ComplexString(this.heap, this.get_child(0));
  }
  
  public get_operator(): string {
    return this.get_operator_address().get_string();
  }
  
  public static allocate(heap: Heap, operator: number): number {
    const address = heap.allocate_object(TAG_CONTROL_logical_i, 1, 1);
    heap.set_cannnot_be_freed(address, true);

    const operator_address = heap.allocate_any(operator);
    heap.set_cannnot_be_freed(operator_address, true);

    heap.set_child(address, 0, operator_address);

    // Unmark cannot-be-free
    heap.set_cannnot_be_freed(address, false);
    heap.set_cannnot_be_freed(operator_address, false);
  
    return address;
  }

  public stringify_i(): string {
    return this.address.toString() + " (logical_i): " + this.get_operator_address().stringify();
  }

  public to_object(): any {
    return "LOGICAL_I " + this.get_operator();
  }
}

export { ControlLogicalI };
