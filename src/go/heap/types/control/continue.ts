/**
 * CONTROL_continue
 * Fields    : None
 */

import { Heap } from "../../heap";
import { HeapObject } from "../objects";
import { TAG_CONTROL_continue } from "../tags";

class ControlContinue extends HeapObject {
    public static allocate(heap: Heap): number {
        return heap.allocate_object(TAG_CONTROL_continue, 0, 0);
    }

    public stringify_i(): string {
        return this.address.toString() + " (continue)";
    }

    public to_object(): any {
        return "continue";
    }
}

export { ControlContinue };
