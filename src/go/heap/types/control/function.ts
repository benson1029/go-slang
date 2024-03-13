/**
 * CONTROL_function
 * Fields    : number of children, number of parameters
 * Children  :
 * - 4 bytes address of the function name (COMPLEX_string)
 * - 4 bytes * num_parameters address of the parameter names (COMPLEX_string)
 */

import { Heap } from "../../heap";
import { ComplexString } from "../complex/string";
import { HeapObject } from "../objects";
import { TAG_CONTROL_function } from "../tags";

class ControlFunction extends HeapObject {
  public get_name_address(): number {
    return this.get_child(0);
  }

  public get_name(): string {
    return new ComplexString(this.heap, this.get_name_address()).get_string();
  }

  public get_param_name_address(index: number): number {
    return this.get_child(index + 1);
  }

  public get_param_name(index: number): string {
    return new ComplexString(this.heap, this.get_param_name_address(index)).get_string();
  }

  public static allocate(heap: Heap, name: string, param_names: string[], body: any): number {
    const address = heap.allocate_object(TAG_CONTROL_function, 2, 1 + param_names.length);
    heap.set_cannnot_be_freed(address, true);

    const name_address = ComplexString.allocate(heap, name);
    heap.set_cannnot_be_freed(name_address, true);

    heap.set_child(address, 0, name_address);
    for (let i = 0; i < param_names.length; i++) {
      const param_name_address = ComplexString.allocate(heap, param_names[i]);
      heap.set_cannnot_be_freed(param_name_address, true);
      heap.set_child(address, i + 1, param_name_address);
    }

    // Unmark cannot-be-free
    heap.set_cannnot_be_freed(address, false);
    heap.set_cannnot_be_freed(name_address, false);
    for (let i = 0; i < param_names.length; i++) {
      const param_name_address = heap.get_child(address, i + 1);
      heap.set_cannnot_be_freed(param_name_address, false);
    }

    return address;
  }
}

export { ControlFunction };
