/**
 * CONTROL_block
 * Fields    : number of children
 * Children  :
 * - 4 bytes address of the body (sequence)
 */

import { Heap } from "../../heap";
import { auto_cast } from "../auto_cast";
import { HeapObject } from "../objects";
import { TAG_CONTROL_block } from "../tags";

class ControlBlock extends HeapObject {
    public get_body_address(): HeapObject {
        return auto_cast(this.heap, this.get_child(0));
    }
    
    public static allocate(heap: Heap, body: any): number {
        const address = heap.allocate_object(TAG_CONTROL_block, 1, 1);
        heap.set_cannnot_be_freed(address, true);

        const body_address = heap.allocate_any(body);
        heap.set_cannnot_be_freed(body_address, true);

        heap.set_child(address, 0, body_address);

        // Unmark cannot-be-free
        heap.set_cannnot_be_freed(address, false);
        heap.set_cannnot_be_freed(body_address, false);

        return address;
    }

    public stringify_i(): string {
        return this.address.toString() + " (block): " + this.get_body_address().stringify();
    }

    public to_object(): any {
        return "{ " + this.get_body_address().to_object() + " }";
    }
}

export { ControlBlock };
