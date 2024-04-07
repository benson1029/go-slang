/**
 * USER_type_wait_group
 * Fields    :
 * - number of children
 * Children  :
 * - 4 bytes address of the name (COMPLEX_string)
 */

import { UserType } from ".";
import { Heap } from "../../../heap";
import { auto_cast } from "../../auto_cast";
import { ComplexString } from "../../complex/string";
import { ComplexWaitGroup } from "../../complex/wait_group";
import { TAGSTRING_USER_type_wait_group, TAG_USER_type_wait_group } from "../../tags";
import { UserVariable } from "../variable";

class UserTypeWaitGroup extends UserType {
  public construct_default_i(variable: UserVariable): void {
    if (this.get_tag() !== TAG_USER_type_wait_group) {
      throw new Error("UserTypeWaitGroup.construct_default: Invalid tag");
    }
    const waitGroup = auto_cast(this.heap, ComplexWaitGroup.allocate(this.heap, 0));
    variable.set_value(waitGroup);
    waitGroup.free();
  }

  public static allocate(heap: Heap): number {
    const address = heap.allocate_object(TAG_USER_type_wait_group, 1, 1);
    const name_address = ComplexString.allocate(
        heap,
        TAGSTRING_USER_type_wait_group
    );
    heap.set_child(address, 0, name_address);
    return address;
  }

  public stringify_i(): string {
    return this.get_name().get_string();
  }
}

export { UserTypeWaitGroup };
