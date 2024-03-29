/**
 * USER_type_builtin
 * Fields    :
 * - number of children
 * Children  :
 * - 4 bytes address of the name (COMPLEX_string)
 */

import { UserType } from ".";
import { Heap } from "../../../heap";
import { ComplexBuiltin } from "../../complex/builtin";
import { ComplexString } from "../../complex/string";
import { TAG_USER_type_builtin } from "../../tags";
import { UserVariable } from "../variable";

class UserTypeBuiltin extends UserType {
  public construct_default_i(variable: UserVariable): void {
    if (this.get_tag() !== TAG_USER_type_builtin) {
      throw new Error("UserTypeBuiltin.construct_default: Invalid tag");
    }
    const builtin = ComplexBuiltin.allocate_default(this.heap);
    variable.set_value(builtin);
    builtin.free();
  }

  public static allocate(heap: Heap, name: string): number {
    const address = heap.allocate_object(TAG_USER_type_builtin, 1, 1);
    const name_address = ComplexString.allocate(heap, name);
    heap.set_child(address, 0, name_address);
    return address;
  }

  public stringify_i(): string {
    return this.get_name().get_string();
  }
}

export { UserTypeBuiltin };
