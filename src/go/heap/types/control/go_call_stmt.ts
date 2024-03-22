/**
 * CONTROL_go_call_stmt
 * Fields    : number of children
 * Children  :
 * - 4 bytes address of the call expression (CONTROL_call)
 */

import { Heap } from "../../heap";
import { HeapObject } from "../objects";
import { ControlCall } from "./call";
import { TAG_CONTROL_go_call_stmt } from "../tags";

class ControlGoCallStmt extends HeapObject {
    public get_body_address(): ControlCall {
        // Guarantee: body is not nil
        return new ControlCall(this.heap, this.get_child(0));
    }
    
    public static allocate(heap: Heap, body: number): number {
        const address = heap.allocate_object(TAG_CONTROL_go_call_stmt, 1, 1);
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
        let result = "";
        result += this.address.toString() + " (go_call_stmt): ";
        result += this.get_body_address().stringify();
        return result;
    }
}

export { ControlGoCallStmt };
