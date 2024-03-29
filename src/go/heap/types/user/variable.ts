/**
 * USER_variable
 * Fields    : number of children
 * Children  : type of the object referenced, address of the object referenced
 */

import { Heap } from "../../heap";
import { auto_cast } from "../auto_cast";
import { HeapObject } from "../objects";
import { PrimitiveNil } from "../primitive/nil";
import { TAG_USER_variable } from "../tags";
import { UserType } from "./type";
import { UserTypeNil } from "./type/nil";

class UserVariable extends HeapObject {
  public get_type(): UserType {
    if (this.get_tag() !== TAG_USER_variable) {
      throw new Error("UserVariable.get_type: Invalid tag");
    }
    return auto_cast(this.heap, this.get_child(0)) as UserType;
  }

  public get_value(): HeapObject {
    if (this.get_tag() !== TAG_USER_variable) {
      throw new Error("UserVariable.get_value: Invalid tag");
    }
    return auto_cast(this.heap, this.get_child(1));
  }

  /**
   * Important: This method calls reference() on the value,
   * and free() on the old value.
   * @param value
   */
  public set_value(value: HeapObject): void {
    if (this.get_tag() !== TAG_USER_variable) {
      throw new Error("UserVariable.set_value: Invalid tag");
    }
    const old_value = this.get_value();
    this.heap.set_child(this.address, 1, value.reference().address);
    old_value.free();
  }

  public reallocate(type_address: UserType, value_address: HeapObject): void {
    if (this.get_tag() !== TAG_USER_variable) {
      throw new Error("UserVariable.reallocate: Invalid tag");
    }

    const old_type = this.get_type();
    const old_value = this.get_value();
    this.heap.set_child(this.address, 0, type_address.reference().address);
    this.heap.set_child(this.address, 1, value_address.reference().address);
    old_type.free();
    old_value.free();

    if (value_address.is_nil()) {
      type_address.construct_default(this);
    }
  }

  public static allocate(
    heap: Heap,
    type_address: UserType,
    value_address: HeapObject
  ): number {
    const address = heap.allocate_object(TAG_USER_variable, 1, 2);
    heap.set_child(address, 0, PrimitiveNil.allocate());
    heap.set_child(address, 1, PrimitiveNil.allocate());

    const variable = new UserVariable(heap, address);
    variable.reallocate(type_address, value_address);

    return address;
  }

  public static allocate_nil(heap: Heap): number {
    const user_type_nil = UserTypeNil.allocate_default(heap);
    const primitive_nil = PrimitiveNil.allocate_default(heap);
    const address = UserVariable.allocate(heap, user_type_nil, primitive_nil);
    user_type_nil.free();
    primitive_nil.free();
    return address;
  }

  public stringify_i(): string {
    return (
      this.address.toString() +
      " (variable): " +
      this.get_type().stringify() +
      " = " +
      this.get_value().stringify()
    );
  }
}

export { UserVariable };
