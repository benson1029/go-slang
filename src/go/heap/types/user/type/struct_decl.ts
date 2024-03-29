/**
 * USER_type_struct_decl
 * Fields    :
 * - number of children
 * Children  :
 * - 4 bytes address of the name (COMPLEX_string)
 */

import { UserType } from ".";
import { Heap } from "../../../heap";
import { ComplexString } from "../../complex/string";
import { TAG_USER_type_struct_decl } from "../../tags";

class UserTypeStructDecl extends UserType {
  public construct_default_i(variable: any): void {
    if (this.get_tag() !== TAG_USER_type_struct_decl) {
      throw new Error("UserTypeStructDecl.construct_default: Invalid tag");
    }
    // Do nothing
  }

  public static allocate(heap: Heap, name: string): number {
    const address = heap.allocate_object(TAG_USER_type_struct_decl, 1, 1);
    heap.set_cannnot_be_freed(address, true);

    const name_address = ComplexString.allocate(heap, name);
    heap.set_cannnot_be_freed(name_address, true);

    heap.set_child(address, 0, name_address);

    // Unmark cannot-be-free
    heap.set_cannnot_be_freed(address, false);
    heap.set_cannnot_be_freed(name_address, false);

    return address;
  }

  public stringify_i(): string {
    return this.get_name().get_string();
  }
}

export { UserTypeStructDecl };
