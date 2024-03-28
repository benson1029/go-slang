/**
 * USER_type_float32
 * Fields    :
 * - number of children
 * Children  :
 * - 4 bytes address of the name (COMPLEX_string)
 */

import { UserType } from ".";
import { Heap } from "../../../heap";
import { ComplexString } from "../../complex/string";
import { PrimitiveFloat32 } from "../../primitive/float32";
import { TAGSTRING_PRIMITIVE_float32, TAG_USER_type_float32 } from "../../tags";
import { UserVariable } from "../variable";

class UserTypeFloat32 extends UserType {
  public construct_default_i(variable: UserVariable): void {
    if (this.get_tag() !== TAG_USER_type_float32) {
      throw new Error("UserTypeFloat32.construct_default: Invalid tag");
    }
    const value = PrimitiveFloat32.allocate_default(this.heap);
    variable.set_value(value);
    value.free();
  }

  public static allocate(heap: Heap): number {
    const address = heap.allocate_object(TAG_USER_type_float32, 1, 1);
    const name_address = ComplexString.allocate(
      heap,
      TAGSTRING_PRIMITIVE_float32
    );
    heap.set_child(address, 0, name_address);
    return address;
  }

  public stringify_i(): string {
    return this.get_name().get_string();
  }
}

export { UserTypeFloat32 };
