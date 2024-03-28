/**
 * USER_type_bool
 * Fields    :
 * - number of children
 * Children  :
 * - 4 bytes address of the name (COMPLEX_string)
 */

import { UserType } from ".";
import { Heap } from "../../../heap";
import { ComplexString } from "../../complex/string";
import { PrimitiveBool } from "../../primitive/bool";
import { TAGSTRING_PRIMITIVE_bool, TAG_USER_type_bool } from "../../tags";
import { UserVariable } from "../variable";

class UserTypeBool extends UserType {
  public construct_default_i(variable: UserVariable): void {
    if (this.get_tag() !== TAG_USER_type_bool) {
      throw new Error("UserTypeBool.construct_default: Invalid tag");
    }
    const value = PrimitiveBool.allocate_default(this.heap);
    variable.set_value(value);
    value.free();
  }

  public static allocate(heap: Heap): number {
    const address = heap.allocate_object(TAG_USER_type_bool, 1, 1);
    const name_address = ComplexString.allocate(heap, TAGSTRING_PRIMITIVE_bool);
    heap.set_child(address, 0, name_address);
    return address;
  }

  public stringify_i(): string {
    return this.get_name().get_string();
  }
}

export { UserTypeBool };
