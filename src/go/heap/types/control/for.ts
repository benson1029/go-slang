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

        const init_address = heap.allocate_any(init);
        heap.set_child(address, 0, init_address);

        const condition_address = heap.allocate_any(condition);
        heap.set_child(address, 1, condition_address);

        const update_address = heap.allocate_any(update);
        heap.set_child(address, 2, update_address);
        
        const body_address = heap.allocate_any(body);
        heap.set_child(address, 3, body_address);

        return address;
    }

    public stringify_i(): string {
        let result = "";
        result += this.address.toString() + " (for): ";
        result += "init: " + this.get_init_address().stringify() + ", ";
        result += "condition: " + this.get_condition_address().stringify() + ", ";
        result += "update: " + this.get_update_address().stringify() + ", ";
        result += "body: " + this.get_body_address().stringify();
        return result;
    }

    public to_object(): any {
        let result = "for (";
        result += this.get_init_address().to_object() + "; ";
        result += this.get_condition_address().to_object() + "; ";
        result += this.get_update_address().to_object() + ") ";
        result += this.get_body_address().to_object();
        return result;
    }
}

export { ControlFor };
