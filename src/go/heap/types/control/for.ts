/**
 * CONTROL_for
 * Fields    : number of children
 * Children  :
 * - 4 bytes address of the init (assign or var)
 * - 4 bytes address of the condition (expression)
 * - 4 bytes address of the update (assign)
 * - 4 bytes address of the body (block)
 */

import { Heap } from "../../heap";
import { auto_cast } from "../auto_cast";
import { HeapObject } from "../objects";
import { TAG_CONTROL_for } from "../tags";

class ControlFor extends HeapObject {
    public get_init_address(): HeapObject {
        return auto_cast(this.heap, this.get_child(0));
    }

    public get_condition_address(): HeapObject {
        return auto_cast(this.heap, this.get_child(1));
    }

    public get_update_address(): HeapObject {
        return auto_cast(this.heap, this.get_child(2));
    }

    public get_body_address(): HeapObject {
        return auto_cast(this.heap, this.get_child(3));
    }
    
    public static allocate(heap: Heap, init: any, condition: any, update: any, body: any): number {
        const address = heap.allocate_object(TAG_CONTROL_for, 4, 4);
        heap.set_cannnot_be_freed(address, true);

        const init_address = heap.allocate_any(init);
        heap.set_cannnot_be_freed(init_address, true);

        const condition_address = heap.allocate_any(condition);
        heap.set_cannnot_be_freed(condition_address, true);

        const update_address = heap.allocate_any(update);
        heap.set_cannnot_be_freed(update_address, true);

        const body_address = heap.allocate_any(body);
        heap.set_cannnot_be_freed(body_address, true);

        heap.set_child(address, 0, init_address);
        heap.set_child(address, 1, condition_address);
        heap.set_child(address, 2, update_address);
        heap.set_child(address, 3, body_address);

        // Unmark cannot-be-free
        heap.set_cannnot_be_freed(address, false);
        heap.set_cannnot_be_freed(init_address, false);
        heap.set_cannnot_be_freed(condition_address, false);
        heap.set_cannnot_be_freed(update_address, false);
        heap.set_cannnot_be_freed(body_address, false);

        return address;
    }
}

export { ControlFor };
