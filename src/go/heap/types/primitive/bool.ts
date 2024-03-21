/**
 * PRIMITIVE_bool
 * Fields    : boolean value
 * Children  : None
 */

import { Primitive } from ".";
import { Heap } from "../../heap";
import { TAG_PRIMITIVE_bool } from "../tags";

class PrimitiveBool extends Primitive {
  public get_type(): string {
    if (this.get_tag() !== TAG_PRIMITIVE_bool) {
      throw new Error("PrimitiveBool.get_type: Invalid tag");
    }
    return "bool";
  }

  public get_value(): boolean {
    if (this.get_tag() !== TAG_PRIMITIVE_bool) {
      throw new Error("PrimitiveBool.get_value: Invalid tag");
    }
    return this.get_field(0) === 1;
  }

  public static allocate(heap: Heap, value: boolean): number {
    const address = heap.allocate_object(TAG_PRIMITIVE_bool, 1, 0);
    heap.set_field(address, 0, value ? 1 : 0);
    return address;
  }

  public stringify_i(): string {
    return this.address.toString() + " (bool): " + (this.get_value() ? "true" : "false");
  }
}

export { PrimitiveBool };
