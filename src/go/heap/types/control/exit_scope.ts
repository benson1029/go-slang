/**
 * CONTROL_exit_scope
 * Fields    : None
 */

import { Heap } from "../../heap";
import { HeapObject } from "../objects";
import { TAG_CONTROL_exit_scope_i } from "../tags";

class ControlExitScopeI extends HeapObject {
    public static allocate(heap: Heap): number {
        return heap.allocate_object(TAG_CONTROL_exit_scope_i, 0, 0);
    }
}

export { ControlExitScopeI };
