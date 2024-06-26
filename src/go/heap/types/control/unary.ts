/**
 * CONTROL_unary
 * Fields    : number of children
 * Children  :
 * - 4 bytes address of the operator (MISC_constant_string)
 * - 4 bytes address of the operand (expression)
 */

import { Heap } from "../../heap";
import { auto_cast } from "../auto_cast";
import { ComplexString } from "../complex/string";
import { HeapObject } from "../objects";
import { TAG_CONTROL_unary } from "../tags";

class ControlUnary extends HeapObject {
  public get_operator_address(): ComplexString {
    // Guarantee: operator is not nil
    return new ComplexString(this.heap, this.get_child(0));
  }

  public get_operator(): string {
    return this.get_operator_address().get_string();
  }

  public get_operand_address(): HeapObject {
    return auto_cast(this.heap, this.get_child(1));
  }

  public static allocate(heap: Heap, operator: string, operand: any): number {
    const address = heap.allocate_object(TAG_CONTROL_unary, 1, 2);

    const operator_address = ComplexString.allocate(heap, operator);
    heap.set_child(address, 0, operator_address);

    const operand_address = heap.allocate_any(operand);
    heap.set_child(address, 1, operand_address);

    return address;
  }

  public stringify_i(): string {
    return this.address.toString() + " (unary): " + this.get_operator() + " " + this.get_operand_address().stringify();
  }

  public to_object(): any {
    return "(" + this.get_operator() + this.get_operand_address().to_object() + ")";
  }
}

export { ControlUnary };
