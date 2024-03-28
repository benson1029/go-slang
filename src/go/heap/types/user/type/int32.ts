/**
 * USER_type_int32
 * Fields    :
 * - number of children
 * Children  :
 * - 4 bytes address of the name (COMPLEX_string)
 * - 4 bytes * num_members (name, type) of the members (COMPLEX_string, USER_type)
 */

import { UserType } from ".";
import { Heap } from "../../../heap";
import { ComplexString } from "../../complex/string";
import { PrimitiveInt32 } from "../../primitive/int32";
import { TAGSTRING_PRIMITIVE_int32, TAG_USER_type_int32 } from "../../tags";
import { UserVariable } from "../variable";

class UserTypeInt32 extends UserType {
  public construct_default_i(variable: UserVariable): void {
    if (this.get_tag() !== TAG_USER_type_int32) {
      throw new Error("UserTypeInt32.construct_default: Invalid tag");
    }
    const value = PrimitiveInt32.allocate_default(this.heap);
    variable.set_value(value);
    value.free();
  }

  public static allocate(heap: Heap): number {
    const address = heap.allocate_object(TAG_USER_type_int32, 1, 1);
    const name_address = ComplexString.allocate(
      heap,
      TAGSTRING_PRIMITIVE_int32
    );
    heap.set_child(address, 0, name_address);
    return address;
  }

  public stringify_i(): string {
    return "";
  }
}

export { UserTypeInt32 };
