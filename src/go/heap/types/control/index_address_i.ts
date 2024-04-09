/**
 * CONTROL_index_address_i
 * Fields    : none
 */

import { Heap } from "../../heap";
import { HeapObject } from "../objects";
import { TAG_CONTROL_index_address_i } from "../tags";

class ControlIndexAddressI extends HeapObject {
    public static allocate(heap: Heap): number {
        return heap.allocate_object(TAG_CONTROL_index_address_i, 0, 0);
    }

    public stringify_i(): string {
        return this.address.toString() + " (index_address_i)";
    }

    public to_object(): any {
        return "INDEX_ADDRESS_I";
    }
}

export { ControlIndexAddressI };
