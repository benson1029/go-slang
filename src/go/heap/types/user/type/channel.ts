/**
 * USER_type_slice
 * Fields    :
 * - number of children
 * Children  :
 * - 4 bytes address of the name (COMPLEX_string)
 * - 4 bytes address of the type of the slice (USER_type)
 */

import { UserType } from ".";
import { Heap } from "../../../heap";
import { auto_cast } from "../../auto_cast";
import { ComplexString } from "../../complex/string";
import { TAG_USER_type_channel } from "../../tags";
import { UserVariable } from "../variable";

class UserTypeChannel extends UserType {
  public get_inner_type(): UserType {
    return auto_cast(this.heap, this.get_child(1)) as UserType;
  }

  public construct_default_i(variable: UserVariable): void {
    if (this.get_tag() !== TAG_USER_type_channel) {
      throw new Error("UserTypeChannel.construct_default: Invalid tag");
    }
    throw new Error("UserTypeChannel.construct_default: Not implemented");
  }

  public static allocate(heap: Heap, type: UserType): number {
    const address = heap.allocate_object(TAG_USER_type_channel, 1, 2);
    const name_address = ComplexString.allocate(
      heap,
      "chan " + type.get_name().get_string()
    );
    heap.set_child(address, 0, name_address);
    heap.set_child(address, 1, type.reference().address);
    return address;
  }

  public stringify_i(): string {
    return this.get_name().get_string();
  }
}

export { UserTypeChannel };
