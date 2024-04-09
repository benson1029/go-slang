/**
 * CONTROL_for_i
 * Fields    : number of children
 * Children  :
 * - 4 bytes address of the condition (expression)
 * - 4 bytes address of the update (assign)
 * - 4 bytes address of the body (block)
 * - 4 bytes address of the loop variable (COMPLEX_string)
 */

import { Heap } from "../../heap";
import { auto_cast } from "../auto_cast";
import { ComplexString } from "../complex/string";
import { HeapObject } from "../objects";
import { TAG_CONTROL_for_i } from "../tags";

class ControlForI extends HeapObject {
    public get_condition_address(): HeapObject {
        return auto_cast(this.heap, this.get_child(0));
    }

    public get_update_address(): HeapObject {
        return auto_cast(this.heap, this.get_child(1));
    }

    public get_body_address(): HeapObject {
        return auto_cast(this.heap, this.get_child(2));
    }

    public get_loop_var(): ComplexString {
        return auto_cast(this.heap, this.get_child(3)) as ComplexString;
    }

    public static allocate(heap: Heap, condition: HeapObject, update: HeapObject, body: HeapObject, loopVar: HeapObject): number {
        const address = heap.allocate_object(TAG_CONTROL_for_i, 4, 4);

        heap.set_child(address, 0, condition.reference().address);
        heap.set_child(address, 1, update.reference().address);
        heap.set_child(address, 2, body.reference().address);
        heap.set_child(address, 3, loopVar.reference().address);

        return address;
    }

    public stringify_i(): string {
        let result = "";
        result += this.address.toString() + " (for_i): ";
        result += "condition: " + this.get_condition_address().stringify() + ", ";
        result += "update: " + this.get_update_address().stringify() + ", ";
        result += "body: " + this.get_body_address().stringify() + ", ";
        result += "loopVar: " + this.get_loop_var().stringify();
        return result;
    }

    public to_object(): any {
        return "FOR_I loop: " + this.get_loop_var().to_object() + " cond: " + this.get_condition_address().to_object()
                + " upd: " + this.get_update_address().to_object() + " body: " + this.get_body_address().to_object();
    }
}

export { ControlForI };
