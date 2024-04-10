/**
 * CONTROL_marker_i
 * Fields    : None
 */

import { Heap } from "../../heap";
import { HeapObject } from "../objects";
import { TAG_CONTROL_marker_i } from "../tags";

class ControlMarkerI extends HeapObject {
    public static allocate(heap: Heap): number {
        return heap.allocate_object(TAG_CONTROL_marker_i, 0, 0);
    }

    public stringify_i(): string {
        return this.address.toString() + " (marker_i)";
    }

    public to_object(): any {
        return "MARKER_I";
    }
}

export { ControlMarkerI };
