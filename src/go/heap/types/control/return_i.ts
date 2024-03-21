/**
 * CONTROL_return_i
 * Fields    : none
 */

import { Heap } from "../../heap";
import { HeapObject } from "../objects";
import { TAG_CONTROL_return_i } from "../tags";

class ControlReturnI extends HeapObject {
  public static allocate(heap: Heap): number {
    const address = heap.allocate_object(TAG_CONTROL_return_i, 0, 0);
    return address;
  }

  public stringify_i(): string {
    return this.address.toString() + " (return_i)";
  }
}

export { ControlReturnI };
