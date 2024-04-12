/**
 * CONTROL_member
 * Fields    :
 * - number of children
 * Children  :
 * - 4 bytes address of the object (expression)
 * - 4 bytes address of the member name (COMPLEX_string)
 */

import { Heap } from "../../heap";
import { auto_cast } from "../auto_cast";
import { ComplexString } from "../complex/string";
import { HeapObject } from "../objects";
import { TAG_CONTROL_member } from "../tags";

class ControlMember extends HeapObject {
  public get_object_address(): number {
    if (this.get_tag() !== TAG_CONTROL_member) {
      throw new Error("Invalid tag for ControlMember");
    }
    return this.get_child(0);
  }

  public get_object(): HeapObject {
    if (this.get_tag() !== TAG_CONTROL_member) {
      throw new Error("Invalid tag for ControlMember");
    }
    return auto_cast(this.heap, this.get_object_address());
  }

  public get_member_name_address(): ComplexString {
    if (this.get_tag() !== TAG_CONTROL_member) {
      throw new Error("Invalid tag for ControlMember");
    }
    return new ComplexString(this.heap, this.get_child(1));
  }

  public get_member_name(): string {
    if (this.get_tag() !== TAG_CONTROL_member) {
      throw new Error("Invalid tag for ControlMember");
    }
    return this.get_member_name_address().get_string();
  }

  public static allocate(heap: Heap, object: any, member: string): number {
    const address = heap.allocate_object(TAG_CONTROL_member, 2, 2);

    const object_address = heap.allocate_any(object);
    heap.set_child(address, 0, object_address);

    const member_name_address = ComplexString.allocate(heap, member);
    heap.set_child(address, 1, member_name_address);

    return address;
  }

  public stringify_i(): string {
    return this.get_object().stringify_i() + "." + this.get_member_name();
  }

  public to_object(): any {
    return this.get_object().to_object() + "." + this.get_member_name();
  }
}

export { ControlMember };
