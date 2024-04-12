/**
 * CONTROL_method
 * Fields    :
 * - number of children
 * - number of parameters
 * - number of captures
 * Children  :
 * - 4 bytes address of the method body (any)
 * - 4 bytes address of the method name (COMPLEX_string)
 * - 4 bytes address of the struct name (COMPLEX_string)
 * - 4 bytes address of the self name (COMPLEX_string)
 * - 4 bytes * num_parameters address of the parameter names (COMPLEX_string)
 * - 4 bytes * num_captures address of the capture names (COMPLEX_string)
 */

import { Heap } from "../../heap";
import { auto_cast } from "../auto_cast";
import { ComplexString } from "../complex/string";
import { HeapObject } from "../objects";
import { TAG_CONTROL_method } from "../tags";

class ControlMethod extends HeapObject {
  public get_body_address(): HeapObject {
    if (this.get_tag() !== TAG_CONTROL_method) {
      throw new Error("ControlMethod.get_body_address: Invalid tag");
    }
    return auto_cast(this.heap, this.get_child(0));
  }

  public get_name_address(): ComplexString {
    if (this.get_tag() !== TAG_CONTROL_method) {
      throw new Error("ControlMethod.get_name_address: Invalid tag");
    }
    return new ComplexString(this.heap, this.get_child(1));
  }

  public get_struct_name_address(): ComplexString {
    if (this.get_tag() !== TAG_CONTROL_method) {
      throw new Error("ControlMethod.get_struct_name_address: Invalid tag");
    }
    return new ComplexString(this.heap, this.get_child(2));
  }

  public get_self_name_address(): ComplexString {
    if (this.get_tag() !== TAG_CONTROL_method) {
      throw new Error("ControlMethod.get_self_name_address: Invalid tag");
    }
    return new ComplexString(this.heap, this.get_child(3));
  }

  public get_param_name_address(index: number): ComplexString {
    if (this.get_tag() !== TAG_CONTROL_method) {
      throw new Error("ControlMethod.get_param_name_address: Invalid tag");
    }
    if (index < 0 || index >= this.get_number_of_params()) {
      throw new Error("ControlMethod.get_param_name_address: Index out of range");
    }
    return new ComplexString(this.heap, this.get_child(4 + index));
  }

  public get_number_of_params(): number {
    if (this.get_tag() !== TAG_CONTROL_method) {
      throw new Error("ControlMethod.get_number_of_params: Invalid tag");
    }
    return this.get_field(1);
  }

  public get_capture_name_address(index: number): ComplexString {
    if (this.get_tag() !== TAG_CONTROL_method) {
      throw new Error("ControlMethod.get_capture_name_address: Invalid tag");
    }
    if (index < 0 || index >= this.get_number_of_captures()) {
      throw new Error("ControlMethod.get_capture_name_address: Index out of range");
    }
    return new ComplexString(
      this.heap,
      this.get_child(4 + this.get_number_of_params() + index)
    );
  }

  public get_number_of_captures(): number {
    if (this.get_tag() !== TAG_CONTROL_method) {
      throw new Error("ControlMethod.get_number_of_captures: Invalid tag");
    }
    return this.get_field(2);
  }

  public static allocate(
    heap: Heap,
    name: string,
    struct_name: string,
    self_name: string,
    param_names: string[],
    capture_names: string[],
    body: any
  ): number {
    const address = heap.allocate_object(
      TAG_CONTROL_method,
      3,
      4 + param_names.length + capture_names.length
    );

    heap.set_field(address, 1, param_names.length);
    heap.set_field(address, 2, capture_names.length);

    const name_address = ComplexString.allocate(heap, name);
    heap.set_child(address, 1, name_address);

    const struct_name_address = ComplexString.allocate(heap, struct_name);
    heap.set_child(address, 2, struct_name_address);

    const self_name_address = ComplexString.allocate(heap, self_name);
    heap.set_child(address, 3, self_name_address);

    for (let i = 0; i < param_names.length; i++) {
      const param_name_address = ComplexString.allocate(heap, param_names[i]);
      heap.set_child(address, 4 + i, param_name_address);
    }

    const body_address = heap.allocate_any(body);
    heap.set_child(address, 0, body_address);

    for (let i = 0; i < capture_names.length; i++) {
      const capture_name_address = ComplexString.allocate(
        heap,
        capture_names[i]
      );
      heap.set_child(address, 4 + param_names.length + i, capture_name_address);
    }

    return address;
  }

  public stringify_i(): string {
    let result = "";
    result += this.address.toString() + " (method): ";
    result += "params: [";
    result += this.get_self_name_address().stringify();
    for (let i = 0; i < this.get_number_of_params(); i++) {
      result += ", ";
      result += this.get_param_name_address(i).stringify();
    }
    result += "], captures: [";
    for (let i = 0; i < this.get_number_of_captures(); i++) {
      if (i > 0) {
        result += ", ";
      }
      result += this.get_capture_name_address(i).stringify();
    }
    result += "]";
    return result;
  }

  public to_object(): any {
    let result = "(" + this.get_self_name_address().get_string() + " " + this.get_struct_name_address().get_string() + ") func ";
    result += this.get_name_address().get_string() + "(";
    for (let i = 0; i < this.get_number_of_params(); i++) {
      if (i > 0) {
        result += ", ";
      }
      result += this.get_param_name_address(i).get_string();
    }
    result += ") ";
    result += this.get_body_address().to_object();
    return result;
  }
}

export { ControlMethod };
