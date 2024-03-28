/**
 * CONTROL_struct
 * Fields    :
 * - number of children
 * Children  :
 * - 4 bytes address of the name (COMPLEX_string)
 * - 4 bytes * num_members (name, type) of the members (COMPLEX_string, COMPLEX_string)
 */

import { Heap } from "../../heap";
import { ComplexString } from "../complex/string";
import { HeapObject } from "../objects";
import { TAG_CONTROL_struct } from "../tags";

class ControlStruct extends HeapObject {
  public get_name(): ComplexString {
    if (this.get_tag() !== TAG_CONTROL_struct) {
      throw new Error("ControlStruct.get_name: Invalid tag");
    }
    return new ComplexString(this.heap, this.get_child(0));
  }

  public get_number_of_members(): number {
    if (this.get_tag() !== TAG_CONTROL_struct) {
      throw new Error("ControlStruct.get_number_of_members: Invalid tag");
    }
    return (this.get_number_of_children() - 1) / 2;
  }

  public get_member_name(index: number): ComplexString {
    if (this.get_tag() !== TAG_CONTROL_struct) {
      throw new Error("ControlStruct.get_member_name: Invalid tag");
    }
    if (index < 0 || index >= this.get_number_of_members()) {
      throw new Error("ControlStruct.get_member_name: Index out of range");
    }
    return new ComplexString(this.heap, this.get_child(1 + 2 * index));
  }

  public get_member_type(index: number): ComplexString {
    if (this.get_tag() !== TAG_CONTROL_struct) {
      throw new Error("ControlStruct.get_member_type: Invalid tag");
    }
    if (index < 0 || index >= this.get_number_of_members()) {
      throw new Error("ControlStruct.get_member_type: Index out of range");
    }
    return new ComplexString(this.heap, this.get_child(2 + 2 * index));
  }

  public static allocate(
    heap: Heap,
    name: string,
    members: Array<{ name: string; type: string }>
  ): number {
    const address = heap.allocate_object(
      TAG_CONTROL_struct,
      1,
      1 + 2 * members.length
    );
    heap.set_child(address, 0, ComplexString.allocate(heap, name));
    for (let i = 0; i < members.length; i++) {
      heap.set_child(
        address,
        1 + 2 * i,
        ComplexString.allocate(heap, members[i].name)
      );
      heap.set_child(
        address,
        2 + 2 * i,
        ComplexString.allocate(heap, members[i].type)
      );
    }
    return address;
  }

  public stringify_i(): string {
    let result = "";
    result += this.address.toString();
    result += " (struct): ";
    result += this.get_name().stringify();
    result += " {";
    for (let i = 0; i < this.get_number_of_members(); i++) {
      result += this.get_member_name(i).stringify();
      result += ": ";
      result += this.get_member_type(i).stringify();
      if (i < this.get_number_of_members() - 1) {
        result += ", ";
      }
    }
    result += "}";
    return result;
  }
}

export { ControlStruct };
