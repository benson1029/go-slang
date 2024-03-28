/**
 * USER_type_string
 * Fields    :
 * - number of children
 * Children  :
 * - 4 bytes address of the name (COMPLEX_string)
 */

import { UserType } from ".";
import { Heap } from "../../../heap";
import { ComplexString } from "../../complex/string";
import { TAGSTRING_COMPLEX_string, TAG_USER_type_string } from "../../tags";
import { UserVariable } from "../variable";

class UserTypeString extends UserType {
  public construct_default_i(variable: UserVariable): void {
    if (this.get_tag() !== TAG_USER_type_string) {
      throw new Error("UserTypeString.construct_default: Invalid tag");
    }
    const value = ComplexString.allocate_default(this.heap);
    variable.set_value(value);
    value.free();
  }

  public static allocate(heap: Heap): number {
    const address = heap.allocate_object(TAG_USER_type_string, 1, 1);
    const name_address = ComplexString.allocate(heap, TAGSTRING_COMPLEX_string);
    heap.set_child(address, 0, name_address);
    return address;
  }

  public stringify_i(): string {
    return this.get_name().get_string();
  }
}

export { UserTypeString };
