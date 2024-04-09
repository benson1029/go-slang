/**
 * CONTROL_make
 * Fields    :
 * - number of children
 * Children  :
 * - 4 bytes address of the type (type)
 * - 4 bytes * num_arguments address of the arguments (expression)
 */

import { Heap } from "../../heap";
import { auto_cast } from "../auto_cast";
import { HeapObject } from "../objects";
import { TAG_CONTROL_make } from "../tags";

class ControlMake extends HeapObject {
  public get_type_address(): number {
    return this.get_child(0);
  }

  public get_type(): HeapObject {
    return auto_cast(this.heap, this.get_type_address());
  }

  public get_arg_address(index: number): HeapObject {
    return auto_cast(this.heap, this.get_child(index + 1));
  }

  public get_number_of_args(): number {
    return this.get_number_of_children() - 1;
  }

  public static allocate(heap: Heap, type: any, args: any[]): number {
    const address = heap.allocate_object(TAG_CONTROL_make, 2, 1 + args.length);
    heap.set_cannnot_be_freed(address, true);

    const type_address = heap.allocate_any(type);
    heap.set_cannnot_be_freed(type_address, true);

    heap.set_child(address, 0, type_address);
    for (let i = 0; i < args.length; i++) {
      const arg_address = heap.allocate_any(args[i]);
      heap.set_child(address, i + 1, arg_address);
    }

    // Unmark cannot-be-free
    heap.set_cannnot_be_freed(address, false);
    heap.set_cannnot_be_freed(type_address, false);

    return address;
  }

  public stringify_i(): string {
    let result = "";
    result += this.address.toString() + " (make): ";
    result += this.get_type().stringify();
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
    let result = "make(" + this.get_type().to_object() + ", ";
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

export { ControlMake };
