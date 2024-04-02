/**
 * CONTROL_struct
 * Fields    :
 * - number of children
 * Children  :
 * - 4 bytes address of the name (COMPLEX_string)
 * - 4 bytes * num_fields (name, type) of the fields (COMPLEX_string, USER_type)
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

  public get_number_of_fields(): number {
    if (this.get_tag() !== TAG_CONTROL_struct) {
      throw new Error("ControlStruct.get_number_of_fields: Invalid tag");
    }
    return (this.get_number_of_children() - 1) / 2;
  }

  public get_field_name(index: number): ComplexString {
    if (this.get_tag() !== TAG_CONTROL_struct) {
      throw new Error("ControlStruct.get_field_name: Invalid tag");
    }
    if (index < 0 || index >= this.get_number_of_fields()) {
      throw new Error("ControlStruct.get_field_name: Index out of range");
    }
    return new ComplexString(this.heap, this.get_child(1 + 2 * index));
  }

  public get_field_type(index: number): ComplexString {
    if (this.get_tag() !== TAG_CONTROL_struct) {
      throw new Error("ControlStruct.get_field_type: Invalid tag");
    }
    if (index < 0 || index >= this.get_number_of_fields()) {
      throw new Error("ControlStruct.get_field_type: Index out of range");
    }
    return new ComplexString(this.heap, this.get_child(2 + 2 * index));
  }

  public static allocate(
    heap: Heap,
    name: string,
    fields: Array<{ name: string; type: any }>
  ): number {
    const address = heap.allocate_object(
      TAG_CONTROL_struct,
      1,
      1 + 2 * fields.length
    );
    heap.set_child(address, 0, ComplexString.allocate(heap, name));
    for (let i = 0; i < fields.length; i++) {
      heap.set_child(
        address,
        1 + 2 * i,
        ComplexString.allocate(heap, fields[i].name)
      );
      heap.set_child(
        address,
        2 + 2 * i,
        heap.allocate_any(fields[i].type)
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
    for (let i = 0; i < this.get_number_of_fields(); i++) {
      result += this.get_field_name(i).stringify();
      result += ": ";
      result += this.get_field_type(i).stringify();
      if (i < this.get_number_of_fields() - 1) {
        result += ", ";
      }
    }
    result += "}";
    return result;
  }
}

export { ControlStruct };
