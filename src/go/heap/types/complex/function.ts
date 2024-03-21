/**
 * COMPLEX_function
 * Fields    : number of children, number of parameters
 * Children  :
 * - 4 bytes address of the function body (any)
 * - 4 bytes address of environment of captures (ENVIRONMENT_frame)
 * - 4 bytes * num_parameters address of the parameter names (COMPLEX_string)
 */

import { Heap } from "../../heap";
import { auto_cast } from "../auto_cast";
import { ComplexString } from "../complex/string";
import { ControlFunction } from "../control/function";
import { EnvironmentFrame } from "../environment/frame";
import { HeapObject } from "../objects";
import { PrimitiveNil } from "../primitive/nil";
import { TAG_COMPLEX_function } from "../tags";

class ComplexFunction extends HeapObject {
  public get_body_address(): HeapObject {
    return auto_cast(this.heap, this.get_child(0));
  }

  public get_environment_address(): EnvironmentFrame {
    return auto_cast(this.heap, this.get_child(1)) as EnvironmentFrame;
  }

  public get_param_name_address(index: number): ComplexString {
    return auto_cast(this.heap, this.get_child(2 + index)) as ComplexString;
  }

  public get_number_of_params(): number {
    return this.get_field(1);
  }

  public static allocate(
    heap: Heap,
    control_function_address: number,
    current_environment_frame_address: number
  ): number {
    const control_function = new ControlFunction(
      heap,
      control_function_address
    );
    const current_environment_frame = new EnvironmentFrame(
      heap,
      current_environment_frame_address
    );

    control_function.set_cannnot_be_freed(true);
    current_environment_frame.set_cannnot_be_freed(true);

    const address = heap.allocate_object(
      TAG_COMPLEX_function,
      2,
      2 + control_function.get_number_of_params()
    );
    heap.set_cannnot_be_freed(address, true);
    heap.set_field(address, 1, control_function.get_number_of_params());

    const body_address = control_function.get_body_address();
    heap.set_child(address, 0, body_address.reference().address);

    const environment_address = EnvironmentFrame.allocate(
      heap,
      PrimitiveNil.allocate()
    );
    heap.set_child(address, 1, environment_address);
    const environment = new EnvironmentFrame(heap, environment_address);

    // Transfer the parameters
    for (let i = 0; i < control_function.get_number_of_params(); i++) {
      const param_name = control_function.get_param_name_address(i);
      heap.set_child(address, 2 + i, param_name.reference().address);
    }

    // Transfer the captures
    for (let i = 0; i < control_function.get_number_of_captures(); i++) {
      const capture_name = control_function.get_capture_name_address(i);
      const capture_entry = current_environment_frame.lookup_entry(
        capture_name.address
      );
      if (capture_entry.is_nil()) {
        throw new Error("Capture does not exist in current scope.");
      }
      environment.insert_entry(capture_entry);
    }

    control_function.set_cannnot_be_freed(false);
    current_environment_frame.set_cannnot_be_freed(false);
    heap.set_cannnot_be_freed(address, false);

    return address;
  }

  public stringify_i(): string {
    let result = "";
    result += this.address.toString() + " (function): ";
    result += "function(";
    for (let i = 0; i < this.get_number_of_params(); i++) {
      result += this.get_param_name_address(i).stringify();
      if (i < this.get_number_of_params() - 1) {
        result += ", ";
      }
    }
    result += ")";
    result += " [";
    result += this.get_environment_address().stringify();
    result += "]";
    result += " {";
    result += this.get_body_address().stringify();
    result += "}";
    return result;
  }
}

export { ComplexFunction };
