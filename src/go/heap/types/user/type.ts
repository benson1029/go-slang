/**
 * USER_type
 * Fields    :
 * - number of children
 * Children  :
 * - 4 bytes address of the name (COMPLEX_string)
 * - 4 bytes * num_members (name, type) of the members (COMPLEX_string, USER_type)
 */

import { Heap } from "../../heap";
import { ComplexString } from "../complex/string";
import { HeapObject } from "../objects";
import { PrimitiveBool } from "../primitive/bool";
import { PrimitiveInt32 } from "../primitive/int32";
import { PrimitiveNil } from "../primitive/nil";
import {
  TAGSTRING_COMPLEX_string,
  TAGSTRING_PRIMITIVE_bool,
  TAGSTRING_PRIMITIVE_float32,
  TAGSTRING_PRIMITIVE_int32,
  TAG_USER_type,
} from "../tags";
import { UserStruct } from "./struct";
import { UserVariable } from "./variable";

class UserType extends HeapObject {
  public get_name(): ComplexString {
    if (this.get_tag() !== TAG_USER_type) {
      throw new Error("UserType.get_name: Invalid tag");
    }
    return new ComplexString(this.heap, this.get_child(0));
  }

  public get_number_of_members(): number {
    if (this.get_tag() !== TAG_USER_type) {
      throw new Error("UserType.get_number_of_members: Invalid tag");
    }
    return (this.get_number_of_children() - 1) / 2;
  }

  public get_member_name(index: number): ComplexString {
    if (this.get_tag() !== TAG_USER_type) {
      throw new Error("UserType.get_member_name: Invalid tag");
    }
    if (index < 0 || index >= this.get_number_of_members()) {
      throw new Error("UserType.get_member_name: Index out of range");
    }
    return new ComplexString(this.heap, this.get_child(1 + 2 * index));
  }

  public get_member_type(index: number): UserType {
    if (this.get_tag() !== TAG_USER_type) {
      throw new Error("UserType.get_member_type: Invalid tag");
    }
    if (index < 0 || index >= this.get_number_of_members()) {
      throw new Error("UserType.get_member_type: Index out of range");
    }
    return new UserType(this.heap, this.get_child(2 + 2 * index));
  }

  public construct_default(variable: UserVariable): void {
    if (this.get_tag() !== TAG_USER_type) {
      throw new Error("UserType.construct_default: Invalid tag");
    }
    const name = this.get_name().get_string();
    let value = PrimitiveNil.allocate_default(this.heap) as HeapObject;
    switch (name) {
      case TAGSTRING_PRIMITIVE_int32:
        value = PrimitiveInt32.allocate_default(this.heap);
        break;
      case TAGSTRING_PRIMITIVE_float32:
        value = PrimitiveInt32.allocate_default(this.heap);
        break;
      case TAGSTRING_PRIMITIVE_bool:
        value = PrimitiveBool.allocate_default(this.heap);
        break;
      case TAGSTRING_COMPLEX_string:
        value = ComplexString.allocate_default(this.heap);
        break;
      default:
        value = new UserStruct(this.heap, UserStruct.allocate(this.heap, this));
        break;
    }
    variable.set_value(value);
    value.free();
  }

  public static allocate(
    heap: Heap,
    name: ComplexString,
    members: Array<{ name: ComplexString; type: UserType }>
  ): number {
    const address = heap.allocate_object(
      TAG_USER_type,
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
    return "";
  }
}

export { UserType };
