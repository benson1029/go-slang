/**
 * CONTROL_assign_i
 * Fields   : None
 */

import { Heap } from "../../heap";
import { HeapObject } from "../objects";
import { TAG_CONTROL_assign_i } from "../tags";

class ControlAssignI extends HeapObject {
    public static allocate(heap: Heap): number {
        return heap.allocate_object(TAG_CONTROL_assign_i, 0, 0);
    }

    public stringify_i(): string {
        return this.address.toString() + " (assign_i)";
    }
}

export { ControlAssignI };
