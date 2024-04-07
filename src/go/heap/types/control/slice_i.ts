/**
 * CONTROL_slice_i
 * Fields    : none
 */

import { Heap } from "../../heap";
import { HeapObject } from "../objects";
import { TAG_CONTROL_slice_i } from "../tags";

class ControlSliceI extends HeapObject {
    public static allocate(heap: Heap): number {
        return heap.allocate_object(TAG_CONTROL_slice_i, 0, 0);
    }

    public stringify_i(): string {
        return this.address.toString() + " (slice_i)";
    }
}

export { ControlSliceI };
