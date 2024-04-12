/**
 * CONTROL_call
 * Fields    : number of children
 * Children  :
 * - 4 bytes address of the called function (any)
 * - 4 bytes * num_arguments address of the arguments (expression)
 */

import { Heap } from "../../heap";
import { auto_cast } from "../auto_cast";
import { HeapObject } from "../objects";
import { TAG_CONTROL_call } from "../tags";

class ControlCall extends HeapObject {
  public get_func_address(): HeapObject {
    return auto_cast(this.heap, this.get_child(0));
  }

  public get_arg_address(index: number): HeapObject {
    return auto_cast(this.heap, this.get_child(index + 1));
  }

  public get_number_of_args(): number {
    return this.get_number_of_children() - 1;
  }

  public static allocate(heap: Heap, func: any, args: any[]): number {
    const address = heap.allocate_object(TAG_CONTROL_call, 2, 1 + args.length);

    const func_address = heap.allocate_any(func);
    heap.set_child(address, 0, func_address);

    for (let i = 0; i < args.length; i++) {
      const arg_address = heap.allocate_any(args[i]);
      heap.set_child(address, i + 1, arg_address);
    }

    return address;
  }

  public stringify_i(): string {
    let result = "";
    result += this.address.toString() + " (call): ";
    result += this.get_func_address().stringify();
    result += "(";
    for (let i = 0; i < this.get_number_of_args(); i++) {
      if (i > 0) {
        result += ", ";
      }
      result += this.get_arg_address(i).stringify();
    }
    result += ")";
    return result;
  }

  public to_object(): any {
    let result = "";
    result += this.get_func_address().to_object();
    result += "(";
    for (let i = 0; i < this.get_number_of_args(); i++) {
      if (i > 0) {
        result += ", ";
      }
      result += this.get_arg_address(i).to_object();
    }
    result += ")";
    return result;
  }
}

export { ControlCall };
