/**
 * CONTROL_binary
 * Fields    : number of children
 * Children  :
 * - 4 bytes address of the operator (MISC_constant_string)
 * - 4 bytes address of the left operand (expression)
 * - 4 bytes address of the right operand (expression)
 */

import { Heap } from "../../heap";
import { auto_cast } from "../auto_cast";
import { ComplexString } from "../complex/string";
import { HeapObject } from "../objects";
import { TAG_CONTROL_binary } from "../tags";

class ControlBinary extends HeapObject {
  public get_operator_address(): ComplexString {
    // Guarantee: operator is not nil
    return new ComplexString(this.heap, this.get_child(0));
  }

  public get_operator(): string {
    return this.get_operator_address().get_string();
  }

  public get_left_operand_address(): HeapObject {
    return auto_cast(this.heap, this.get_child(1));
  }

  public get_right_operand_address(): HeapObject {
    return auto_cast(this.heap, this.get_child(2));
  }

  public static allocate(heap: Heap, operator: string, left_operand: any, right_operand: any): number {
    const address = heap.allocate_object(TAG_CONTROL_binary, 1, 3);

    const operator_address = ComplexString.allocate(heap, operator);
    heap.set_child(address, 0, operator_address);

    const left_operand_address = heap.allocate_any(left_operand);
    heap.set_child(address, 1, left_operand_address);

    const right_operand_address = heap.allocate_any(right_operand);
    heap.set_child(address, 2, right_operand_address);

    return address;
  }

  public stringify_i(): string {
    let result = "";
    result += this.address.toString() + " (binary): ";
    result += this.get_operator() + " ";
    result += this.get_left_operand_address().stringify() + " ";
    result += this.get_right_operand_address().stringify();
    return result;
  }

  public to_object(): any {
    return "(" + this.get_left_operand_address().to_object() + " " + this.get_operator()
        + " " + this.get_right_operand_address().to_object() + ")";
  }
}

export { ControlBinary };
