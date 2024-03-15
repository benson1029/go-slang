/**
 * CONTROL_pop_i
 * Fields    : none
 */

import { Heap } from "../../heap";
import { HeapObject } from "../objects";
import { TAG_CONTROL_pop_i } from "../tags";

class ControlPopI extends HeapObject {
    public static allocate(heap: Heap): number {
        return heap.allocate_object(TAG_CONTROL_pop_i, 0, 0);
    }
}

export { ControlPopI };
