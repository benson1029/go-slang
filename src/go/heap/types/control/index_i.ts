/**
 * CONTROL_index_i
 * Fields    : none
 */

import { Heap } from "../../heap";
import { HeapObject } from "../objects";
import { TAG_CONTROL_index_i } from "../tags";

class ControlIndexI extends HeapObject {
    public static allocate(heap: Heap): number {
        return heap.allocate_object(TAG_CONTROL_index_i, 0, 0);
    }

    public stringify_i(): string {
        return this.address.toString() + " (index_i)";
    }
}

export { ControlIndexI };
