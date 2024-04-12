/**
 * CONTROL_method_member
 * Fields    :
 * - number of children
 * Children  :
 * - 4 bytes address of the object (expression)
 * - 4 bytes address of the member name (COMPLEX_string)
 * - 4 bytes address of the struct name (COMPLEX_string)
 */

import { Heap } from "../../heap";
import { auto_cast } from "../auto_cast";
import { ComplexString } from "../complex/string";
import { HeapObject } from "../objects";
import { TAG_CONTROL_method_member } from "../tags";

class ControlMethodMember extends HeapObject {
  public get_object_address(): number {
    if (this.get_tag() !== TAG_CONTROL_method_member) {
      throw new Error("Invalid tag for ControlMethodMember");
    }
    return this.get_child(0);
  }

  public get_object(): HeapObject {
    if (this.get_tag() !== TAG_CONTROL_method_member) {
      throw new Error("Invalid tag for ControlMethodMember");
    }
    return auto_cast(this.heap, this.get_object_address());
  }

  public get_member_name_address(): ComplexString {
    if (this.get_tag() !== TAG_CONTROL_method_member) {
      throw new Error("Invalid tag for ControlMethodMember");
    }
    return new ComplexString(this.heap, this.get_child(1));
  }

  public get_member_name(): string {
    if (this.get_tag() !== TAG_CONTROL_method_member) {
      throw new Error("Invalid tag for ControlMethodMember");
    }
    return this.get_member_name_address().get_string();
  }

  public get_struct_name_address(): ComplexString {
    if (this.get_tag() !== TAG_CONTROL_method_member) {
      throw new Error("Invalid tag for ControlMethodMember");
    }
    return new ComplexString(this.heap, this.get_child(2));
  }

  public get_struct_name(): string {
    if (this.get_tag() !== TAG_CONTROL_method_member) {
      throw new Error("Invalid tag for ControlMethodMember");
    }
    return this.get_struct_name_address().get_string();
  }

  public static allocate(heap: Heap, object: any, member: string, struct: string): number {
    const address = heap.allocate_object(TAG_CONTROL_method_member, 1, 3);

    const object_address = heap.allocate_any(object);
    heap.set_child(address, 0, object_address);

    const member_name_address = ComplexString.allocate(heap, member);
    heap.set_child(address, 1, member_name_address);

    const struct_name_address = ComplexString.allocate(heap, struct);
    heap.set_child(address, 2, struct_name_address);

    return address;
  }

  public stringify_i(): string {
    return this.get_object().stringify_i() + "." + this.get_member_name();
  }

  public to_object(): any {
    return this.get_object().to_object() + "." + this.get_member_name();
  }
}

export { ControlMethodMember };
