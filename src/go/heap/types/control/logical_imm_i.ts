/**
 * CONTROL_logical_imm_i
 * Fields    : number of children
 * Children  :
 * - 4 bytes address of the right expression (expression)
 * - 4 bytes address of the operator (PRIMITIVE_string)
 */

import { Heap } from "../../heap";
import { HeapObject } from "../objects";
import { ComplexString } from "../complex/string";
import { TAG_CONTROL_logical_imm_i } from "../tags";

class ControlLogicalImmI extends HeapObject {
  public get_right_address(): HeapObject {
    return new HeapObject(this.heap, this.get_child(0));
  }

  public get_operator_address(): ComplexString {
    return new ComplexString(this.heap, this.get_child(1));
  }

  public get_operator(): string {
    return this.get_operator_address().get_string();
  }

  public static allocate(heap: Heap, right: number, operator: number): number {
    const address = heap.allocate_object(TAG_CONTROL_logical_imm_i, 2, 2);
    heap.set_cannnot_be_freed(address, true);

    const right_address = heap.allocate_any(right);
    heap.set_cannnot_be_freed(right_address, true);

    const operator_address = heap.allocate_any(operator);
    heap.set_cannnot_be_freed(operator_address, true);

    heap.set_child(address, 0, right_address);
    heap.set_child(address, 1, operator_address);

    // Unmark cannot-be-free
    heap.set_cannnot_be_freed(address, false);
    heap.set_cannnot_be_freed(right_address, false);
    heap.set_cannnot_be_freed(operator_address, false);

    return address;
  }

  public stringify_i(): string {
    return this.address.toString() + " (logical_imm_i): " + this.get_right_address().stringify() + " " + this.get_operator();
  }
}

export { ControlLogicalImmI };
