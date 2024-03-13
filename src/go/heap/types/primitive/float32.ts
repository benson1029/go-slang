/**
 * PRIMITIVE_float32
 * Fields    : float32 value
 * Children  : None
 *
 * @param value float32 value
 * @returns address of the object
 */

import { Heap } from "../../heap";
import { HeapObject } from "../objects";
import { TAG_PRIMITIVE_float32 } from "../tags";

class PrimitiveFloat32 extends HeapObject {
  public get_value(): number {
    return this.heap.get_field_float32(this.address, 0);
  }

  public static allocate(heap: Heap, value: number): number {
    const address = heap.allocate_object(TAG_PRIMITIVE_float32, 1, 0);
    heap.set_field_float32(address, 0, value);
    return address;
  }
}

export { PrimitiveFloat32 };
