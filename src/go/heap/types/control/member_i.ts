/**
 * CONTROL_member_i
 * Fields    :
 * - number of children
 * Children  :
 * - 4 bytes address of the member name (COMPLEX_string)
 */

import { Heap } from "../../heap";
import { ComplexString } from "../complex/string";
import { HeapObject } from "../objects";
import { TAG_CONTROL_member_i } from "../tags";

class ControlMemberI extends HeapObject {
  public get_member_name_address(): ComplexString {
    if (this.get_tag() !== TAG_CONTROL_member_i) {
      throw new Error("Invalid tag for ControlMemberI");
    }
    return new ComplexString(this.heap, this.get_child(0));
  }

  public get_member_name(): string {
    if (this.get_tag() !== TAG_CONTROL_member_i) {
      throw new Error("Invalid tag for ControlMemberI");
    }
    return this.get_member_name_address().get_string();
  }

  public static allocate(heap: Heap, member: ComplexString): number {
    const address = heap.allocate_object(TAG_CONTROL_member_i, 1, 1);
    heap.set_child(address, 0, member.reference().address);
    return address;
  }

  public stringify_i(): string {
    return "." + this.get_member_name();
  }

  public to_object(): any {
    return "MEMBER_I " + this.get_member_name();
  }
}

export { ControlMemberI };
