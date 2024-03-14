/**
 * PRIMITIVE_rune
 * Fields    : rune value (int32)
 * Children  : None
 */

import { Primitive } from ".";
import { Heap } from "../../heap";
import { TAG_PRIMITIVE_rune } from "../tags";

class PrimitiveRune extends Primitive {
  public get_type(): string {
    return "rune";
  }

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
