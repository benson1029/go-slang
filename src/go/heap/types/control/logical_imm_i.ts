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
import { auto_cast } from "../auto_cast";

class ControlLogicalImmI extends HeapObject {
  public get_right_address(): HeapObject {
    return auto_cast(this.heap, this.get_child(0));
  }

  public get_operator_address(): ComplexString {
    return new ComplexString(this.heap, this.get_child(1));
  }

  public get_operator(): string {
    return this.get_operator_address().get_string();
  }

  public static allocate(heap: Heap, right: number, operator: number): number {
    const address = heap.allocate_object(TAG_CONTROL_logical_imm_i, 2, 2);

    const right_address = heap.allocate_any(right);
    heap.set_child(address, 0, right_address);

    const operator_address = heap.allocate_any(operator);
    heap.set_child(address, 1, operator_address);

    return address;
  }

  public stringify_i(): string {
    return this.address.toString() + " (logical_imm_i): " + this.get_right_address().stringify() + " " + this.get_operator();
  }

  public to_object(): any {
    return "LOGICAL_IMM_I " + this.get_operator() + " " + this.get_right_address().to_object();
  }
}

export { ControlLogicalImmI };
