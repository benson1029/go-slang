/**
 * USER_type_struct
 * Fields    :
 * - number of children
 * Children  :
 * - 4 bytes address of the name (COMPLEX_string)
 * - 4 bytes * num_members (name, type) of the members (COMPLEX_string, USER_type)
 */

import { UserType } from ".";
import { Heap } from "../../../heap";
import { auto_cast } from "../../auto_cast";
import { ComplexString } from "../../complex/string";
import { TAG_USER_type_struct } from "../../tags";
import { UserStruct } from "../struct";
import { UserVariable } from "../variable";

class UserTypeStruct extends UserType {
  public get_number_of_members(): number {
    return (this.get_number_of_children() - 1) / 2;
  }

  public get_member_name(index: number): ComplexString {
    if (index < 0 || index >= this.get_number_of_members()) {
      throw new Error("UserTypeStruct.get_member_name: Index out of range");
    }
    return new ComplexString(this.heap, this.get_child(1 + 2 * index));
  }

  public get_member_type(index: number): UserType {
    if (index < 0 || index >= this.get_number_of_members()) {
      throw new Error("UserTypeStruct.get_member_type: Index out of range");
    }
    return auto_cast(this.heap, this.get_child(2 + 2 * index)) as UserType;
  }

  public construct_default_i(variable: UserVariable): void {
    if (this.get_tag() !== TAG_USER_type_struct) {
      throw new Error("UserTypeStruct.construct_default_i: Invalid tag");
    }
    const value = new UserStruct(
      this.heap,
      UserStruct.allocate(this.heap, this)
    );
    variable.set_value(value);
    value.free();
  }

  public static allocate(
    heap: Heap,
    name: ComplexString,
    members: Array<{ name: ComplexString; type: UserType }>
  ): number {
    const address = heap.allocate_object(
      TAG_USER_type_struct,
      1,
      1 + 2 * members.length
    );
    heap.set_child(address, 0, name.reference().address);
    for (let i = 0; i < members.length; i++) {
      heap.set_child(address, 1 + 2 * i, members[i].name.reference().address);
      heap.set_child(address, 2 + 2 * i, members[i].type.reference().address);
    }
    return address;
  }

  public stringify_i(): string {
    let result = "";
    result += this.get_name().get_string();
    result += " {";
    for (let i = 0; i < this.get_number_of_members(); i++) {
      if (i > 0) {
        result += ",";
      }
      result += " " + this.get_member_name(i).get_string();
      result += ": " + this.get_member_type(i).stringify();
    }
    result += " }";
    return result;
  }
}

export { UserTypeStruct };
