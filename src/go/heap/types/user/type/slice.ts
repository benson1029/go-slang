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
import { TAG_USER_type_slice } from "../../tags";
import { UserVariable } from "../variable";

class UserTypeSlice extends UserType {
  public get_inner_type(): UserType {
    return auto_cast(this.heap, this.get_child(1)) as UserType;
  }

  public construct_default_i(variable: UserVariable): void {
    if (this.get_tag() !== TAG_USER_type_slice) {
      throw new Error("UserTypeSlice.construct_default: Invalid tag");
    }
    throw new Error("UserTypeSlice.construct_default: Not implemented");
  }

  public static allocate(heap: Heap, type: any): number {
    const address = heap.allocate_object(TAG_USER_type_slice, 1, 2);
    heap.set_cannnot_be_freed(address, true);

    const type_address = heap.allocate_any(type);
    heap.set_child(address, 1, type_address);

    const name_address = ComplexString.allocate(
      heap,
      "[]" + (auto_cast(heap, type_address) as UserType).get_name().get_string()
    );
    heap.set_child(address, 0, name_address);

    // Unmark cannot-be-freed
    heap.set_cannnot_be_freed(address, false);
    heap.set_cannnot_be_freed(name_address, false);
  
    return address;
  }

  public stringify_i(): string {
    return this.get_name().get_string();
  }
}

export { UserTypeSlice };
