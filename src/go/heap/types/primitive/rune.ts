/**
 * PRIMITIVE_rune
 * Fields    : rune value (int32)
 * Children  : None
 *
 * @param value rune value
 * @returns address of the object
 */

import { Heap } from "../../heap";
import { HeapObject } from "../objects";
import { TAG_PRIMITIVE_rune } from "../tags";

class PrimitiveRune extends HeapObject {
  public get_value(): number {
    return this.get_field(0);
  }

  public static allocate(heap: Heap, value: number): number {
    const address = heap.allocate_object(TAG_PRIMITIVE_rune, 1, 0);
    heap.set_field(address, 0, value);
    return address;
  }
}

export { PrimitiveRune };
