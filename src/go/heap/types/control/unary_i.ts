/**
 * CONTROL_unary_i
 * Fields    : number of children
 * Children  :
 * - 4 bytes address of the operator (MISC_constant_string)
 */

import { Heap } from "../../heap";
import { ComplexString } from "../complex/string";
import { HeapObject } from "../objects";
import { TAG_CONTROL_unary_i } from "../tags";

class ControlUnaryI extends HeapObject {
    public get_operator_address(): ComplexString {
        // Guarantee: operator is not nil
        return new ComplexString(this.heap, this.get_child(0));
    }
    
    public get_operator(): string {
        return this.get_operator_address().get_string();
    }
    
    public static allocate(heap: Heap, operator: ComplexString): number {
        const address = heap.allocate_object(TAG_CONTROL_unary_i, 1, 1);
        heap.set_child(address, 0, operator.reference().address);
        return address;
    }

    public stringify_i(): string {
        let result = "";
        result += this.address.toString() + " (unary_i): ";
        result += this.get_operator_address().stringify();
        return result;
    }
}

export { ControlUnaryI };
