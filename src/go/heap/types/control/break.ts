/**
 * CONTROL_break
 * Fields    : None
 */

import { Heap } from "../../heap";
import { HeapObject } from "../objects";
import { TAG_CONTROL_break } from "../tags";

class ControlBreak extends HeapObject {
    public static allocate(heap: Heap): number {
        return heap.allocate_object(TAG_CONTROL_break, 0, 0);
    }

    public stringify_i(): string {
        return this.address.toString() + " (break)";
    }
}

export { ControlBreak };
