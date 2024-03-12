/**
 * PRIMITIVE_int32
 * Fields    : int32 value
 * Children  : None
 *
 * @param value integer value
 * @returns address of the object
 */

import { Heap } from "../../heap";
import { HeapObject } from "../objects";
import { TAG_PRIMITIVE_int32 } from "../tags";

class PrimitiveInt32 extends HeapObject {
  public copy(): number {
    const copy_address = PrimitiveInt32.allocate(this.heap, this.get_value());
    return copy_address;
  }

  public get_value(): number {
    return this.get_field(0);
  }

  public static allocate(heap: Heap, value: number): number {
    const address = heap.allocate_object(TAG_PRIMITIVE_int32, 1, 0);
    heap.set_field(address, 0, value);
    return address;
  }
}

export { PrimitiveInt32 };
