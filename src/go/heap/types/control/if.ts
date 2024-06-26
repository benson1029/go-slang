/**
 * CONTROL_if
 * Fields    : Number of children
 * Children  :
 * - 4 bytes address of the condition (expression)
 * - 4 bytes address of the then_body (block)
 * - 4 bytes address of the else_body (block)
 */

import { Heap } from "../../heap";
import { auto_cast } from "../auto_cast";
import { HeapObject } from "../objects";
import { TAG_CONTROL_if } from "../tags";

class ControlIf extends HeapObject {
    public get_condition_address(): HeapObject {
        return auto_cast(this.heap, this.get_child(0));
    }

    public get_then_body_address(): HeapObject {
        return auto_cast(this.heap, this.get_child(1));
    }

    public get_else_body_address(): HeapObject {
        return auto_cast(this.heap, this.get_child(2));
    }

    public static allocate(heap: Heap, condition: any, then_body: any, else_body: any): number {
        const address = heap.allocate_object(TAG_CONTROL_if, 3, 3);

        const condition_address = heap.allocate_any(condition);
        heap.set_child(address, 0, condition_address);

        const then_body_address = heap.allocate_any(then_body);
        heap.set_child(address, 1, then_body_address);

        const else_body_address = heap.allocate_any(else_body);
        heap.set_child(address, 2, else_body_address);

        return address;
    }

    public stringify_i(): string {
        let result = "";
        result += this.address.toString() + " (if): ";
        result += "condition: " + this.get_condition_address().stringify() + ", ";
        result += "then_body: " + this.get_then_body_address().stringify() + ", ";
        result += "else_body: " + this.get_else_body_address().stringify();
        return result;
    }

    public to_object(): any {
        return "if (" + this.get_condition_address().to_object() + ") "
                + this.get_then_body_address().to_object() + " else " + this.get_else_body_address().to_object();
    }
}

export { ControlIf };
