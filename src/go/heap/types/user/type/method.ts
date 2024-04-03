/**
 * USER_type_method
 * Fields    :
 * - number of children
 * Children  :
 * - 4 bytes address of the name (COMPLEX_string)
 */

import { UserType } from ".";
import { Heap } from "../../../heap";
import { ComplexString } from "../../complex/string";
import { TAG_USER_type_method } from "../../tags";
import { UserVariable } from "../variable";

class UserTypeMethod extends UserType {
  public construct_default_i(variable: UserVariable): void {
    if (this.get_tag() !== TAG_USER_type_method) {
      throw new Error("UserTypeMethod.construct_default: Invalid tag");
    }
    throw new Error("Method type cannot be constructed");
  }

  public static allocate(heap: Heap): number {
    const address = heap.allocate_object(TAG_USER_type_method, 1, 1);
    const name_address = ComplexString.allocate(heap, "method");
    heap.set_child(address, 0, name_address);
    return address;
  }

  public stringify_i(): string {
    return this.get_name().get_string();
  }
}

export { UserTypeMethod };
