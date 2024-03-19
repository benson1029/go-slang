/**
 * CONTROL_if_i
 * Fields    : Number of children
 * Children  :
 * - 4 bytes address of the then_body (block)
 * - 4 bytes address of the else_body (block)
 */

import { Heap } from "../../heap";
import { auto_cast } from "../auto_cast";
import { HeapObject } from "../objects";
import { TAG_CONTROL_if_i } from "../tags";

class ControlIfI extends HeapObject {
    public get_then_body_address(): HeapObject {
        return auto_cast(this.heap, this.get_child(0));
    }

    public get_else_body_address(): HeapObject {
        return auto_cast(this.heap, this.get_child(1));
    }

    public static allocate(heap: Heap, then_body: HeapObject, else_body: HeapObject): number {
        const address = heap.allocate_object(TAG_CONTROL_if_i, 2, 2);
        
        heap.set_child(address, 0, then_body.reference().address);
        heap.set_child(address, 1, else_body.reference().address);

        return address;
    }
}

export { ControlIfI };
