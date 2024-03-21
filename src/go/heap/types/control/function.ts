/**
 * CONTROL_function
 * Fields    : number of children, number of parameters, number of captures
 * Children  :
 * - 4 bytes address of the function name (COMPLEX_string)
 * - 4 bytes address of the function body (any)
 * - 4 bytes * num_parameters address of the parameter names (COMPLEX_string)
 * - 4 bytes * num_captures address of the capture names (COMPLEX_string)
 */

import { Heap } from "../../heap";
import { auto_cast } from "../auto_cast";
import { ComplexString } from "../complex/string";
import { HeapObject } from "../objects";
import { PrimitiveNil } from "../primitive/nil";
import { TAG_CONTROL_function } from "../tags";

class ControlFunction extends HeapObject {
  public get_name_address(): ComplexString | PrimitiveNil {
    return auto_cast(this.heap, this.get_child(0)) as
      | ComplexString
      | PrimitiveNil;
  }

  public get_name(): string | null {
    const name_address = this.get_name_address();
    if (!name_address.is_nil()) {
      return (name_address as ComplexString).get_string();
    } else {
      return null;
    }
  }

  public get_body_address(): HeapObject {
    return auto_cast(this.heap, this.get_child(1));
  }

  public get_param_name_address(index: number): ComplexString {
    // Guarantee: param_name is not nil
    if (index < 0 || index >= this.get_number_of_params()) {
      throw new Error("Index of parameter name is out of range");
    }
    return new ComplexString(this.heap, this.get_child(2 + index));
  }

  public get_capture_name_address(index: number): ComplexString {
    // Guarantee: capture_name is not nil
    if (index < 0 || index >= this.get_number_of_captures()) {
      throw new Error("Index of capture name is out of range");
    }
    return new ComplexString(
      this.heap,
      this.get_child(2 + this.get_number_of_params() + index)
    );
  }

  public get_number_of_params(): number {
    return this.get_field(1);
  }

  public get_number_of_captures(): number {
    return this.get_field(2);
  }

  public static allocate(
    heap: Heap,
    name: string,
    param_names: string[],
    capture_names: string[],
    body: any
  ): number {
    const address = heap.allocate_object(
      TAG_CONTROL_function,
      3,
      2 + param_names.length + capture_names.length
    );
    heap.set_cannnot_be_freed(address, true);

    heap.set_field(address, 1, param_names.length);
    heap.set_field(address, 2, capture_names.length);

    const name_address =
      name === null
        ? PrimitiveNil.allocate()
        : ComplexString.allocate(heap, name);
    heap.set_cannnot_be_freed(name_address, true);

    const body_address = heap.allocate_any(body);
    heap.set_cannnot_be_freed(body_address, true);

    heap.set_child(address, 0, name_address);
    heap.set_child(address, 1, body_address);

    for (let i = 0; i < param_names.length; i++) {
      const param_name_address = ComplexString.allocate(heap, param_names[i]);
      heap.set_cannnot_be_freed(param_name_address, true);
      heap.set_child(address, i + 2, param_name_address);
    }

    for (let i = 0; i < capture_names.length; i++) {
      const capture_name_address = ComplexString.allocate(
        heap,
        capture_names[i]
      );
      heap.set_cannnot_be_freed(capture_name_address, true);
      heap.set_child(address, i + 2 + param_names.length, capture_name_address);
    }

    // Unmark cannot-be-free
    heap.set_cannnot_be_freed(address, false);
    heap.set_cannnot_be_freed(name_address, false);
    for (let i = 0; i < param_names.length; i++) {
      const param_name_address = heap.get_child(address, i + 2);
      heap.set_cannnot_be_freed(param_name_address, false);
    }
    for (let i = 0; i < capture_names.length; i++) {
      const capture_name_address = heap.get_child(
        address,
        i + 2 + param_names.length
      );
      heap.set_cannnot_be_freed(capture_name_address, false);
    }

    return address;
  }

  public stringify_i(): string {
    let result = "";
    result += this.address.toString() + " (function): ";
    result += "name: " + this.get_name_address().stringify() + ", ";
    result += "params: [";
    for (let i = 0; i < this.get_number_of_params(); i++) {
      if (i > 0) {
        result += ", ";
      }
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
}

export { ControlFunction };
