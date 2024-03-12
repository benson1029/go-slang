/**
 * PRIMITIVE_bool
 * Fields    : boolean value
 * Children  : None
 *
 * @param value boolean value
 * @returns address of the object
 */

import { Heap } from "../../heap";
import { HeapObject } from "../objects";
import { TAG_PRIMITIVE_bool } from "../tags";

class PrimitiveBool extends HeapObject {
  public copy(): number {
    const copy_address = PrimitiveBool.allocate(this.heap, this.get_value());
    return copy_address;
  }

  public get_value(): boolean {
    return this.get_field(0) === 1;
  }

  public static allocate(heap: Heap, value: boolean): number {
    const address = heap.allocate_object(TAG_PRIMITIVE_bool, 1, 0);
    heap.set_field(address, 0, value ? 1 : 0);
    return address;
  }
}

export { PrimitiveBool };
