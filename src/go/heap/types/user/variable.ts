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

  public static allocate(
    heap: Heap,
    type_address: UserType,
    value_address: HeapObject
  ): number {
    const address = heap.allocate_object(TAG_USER_variable, 1, 2);
    heap.set_child(address, 0, type_address.reference().address);
    heap.set_child(address, 1, value_address.reference().address);

    if (value_address.is_nil()) {
      type_address.construct_default(new UserVariable(heap, address));
    }

    return address;
  }

  public static allocate_nil(heap: Heap): number {
    return UserVariable.allocate(
      heap,
      UserTypeNil.allocate_default(heap),
      PrimitiveNil.allocate_default(heap)
    );
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
