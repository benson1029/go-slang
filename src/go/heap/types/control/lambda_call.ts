/**
 * CONTROL_call
 * Fields    : number of children
 * Children  :
 * - 4 bytes address of the called function name (COMPLEX_string)
 * - 4 bytes * num_arguments address of the arguments (expression)
 */

import { Heap } from "../../heap";
import { HeapObject } from "../objects";
import { TAG_CONTROL_lambda_call } from "../tags";

class ControlLambdaCall extends HeapObject {
  public get_func_address(): number {
    return this.get_child(0);
  }

  public get_arg_address(index: number): number {
    return this.get_child(index + 1);
  }

  public static allocate(heap: Heap, func: any, args: any[]): number {
    const address = heap.allocate_object(TAG_CONTROL_lambda_call, 2, args.length);
    heap.set_cannnot_be_freed(address, true);

    const func_address = heap.allocate_any(func);
    heap.set_cannnot_be_freed(func_address, true);

    heap.set_child(address, 0, func_address);
    for (let i = 0; i < args.length; i++) {
      const arg_address = heap.allocate_any(args[i]);
      heap.set_cannnot_be_freed(arg_address, true);
      heap.set_child(address, i + 1, arg_address);
    }

    // Unmark cannot-be-free
    heap.set_cannnot_be_freed(address, false);
    heap.set_cannnot_be_freed(func_address, false);
    for (let i = 0; i < args.length; i++) {
      const arg_address = heap.get_child(address, i + 1);
      heap.set_cannnot_be_freed(arg_address, false);
    }

    return address;
  }
}

export { ControlLambdaCall };

