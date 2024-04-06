/**
 * USER_type_mutex
 * Fields    :
 * - number of children
 * Children  :
 * - 4 bytes address of the name (COMPLEX_string)
 */

import { UserType } from ".";
import { Heap } from "../../../heap";
import { auto_cast } from "../../auto_cast";
import { ComplexMutex } from "../../complex/mutex";
import { ComplexString } from "../../complex/string";
import { TAGSTRING_USER_type_mutex, TAG_USER_type_mutex } from "../../tags";
import { UserVariable } from "../variable";

class UserTypeMutex extends UserType {
  public construct_default_i(variable: UserVariable): void {
    if (this.get_tag() !== TAG_USER_type_mutex) {
      throw new Error("UserTypeMutex.construct_default: Invalid tag");
    }
    const mutex = auto_cast(this.heap, ComplexMutex.allocate(this.heap));
    variable.set_value(mutex);
    mutex.free();
  }

  public static allocate(heap: Heap): number {
    const address = heap.allocate_object(TAG_USER_type_mutex, 1, 1);
    const name_address = ComplexString.allocate(
        heap,
        TAGSTRING_USER_type_mutex
    );
    heap.set_child(address, 0, name_address);
    return address;
  }

  public stringify_i(): string {
    return this.get_name().get_string();
  }
}

export { UserTypeMutex };
