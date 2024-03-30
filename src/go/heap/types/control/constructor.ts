/**
 * CONTROL_constructor
 * Fields    :
 * - number of children
 * Children  :
 * - 4 bytes address of the type (USER_type)
 * - 4 bytes * number of arguments addresses of the arguments (expression)
 */

import { Heap } from "../../heap";
import { auto_cast } from "../auto_cast";
import { HeapObject } from "../objects";
import { TAG_CONTROL_constructor } from "../tags";
import { UserType } from "../user/type";

class ControlConstructor extends HeapObject {
  public get_type(): UserType {
    return auto_cast(this.heap, this.get_child(0)) as UserType;
  }

  public get_number_of_arguments(): number {
    return this.get_number_of_children() - 1;
  }

  public get_argument(index: number): HeapObject {
    if (index < 0 || index >= this.get_number_of_arguments()) {
      throw new Error("ControlConstructor.get_argument: Index out of range");
    }
    return auto_cast(this.heap, this.get_child(1 + index));
  }

  public static allocate(heap: Heap, type: any, args: any[]): number {
    const address = heap.allocate_object(TAG_CONTROL_constructor, 1, 1 + args.length);
    heap.set_cannnot_be_freed(address, true);

    const type_address = heap.allocate_any(type);
    heap.set_child(address, 0, type_address);

    for (let i = 0; i < args.length; i++) {
      const arg_address = heap.allocate_any(args[i]);
      heap.set_child(address, 1 + i, arg_address);
    }

    // Unmark cannot be freed
    heap.set_cannnot_be_freed(address, false);

    return address;
  }

  public stringify_i(): string {
    let result = "";
    result += this.address.toString() + " (constructor): ";
    result += this.get_type().stringify();
    result += "(";
    for (let i = 0; i < this.get_number_of_arguments(); i++) {
      if (i > 0) {
        result += ", ";
      }
      result += this.get_argument(i).stringify();
    }
    result += ")";
    return result;
  }
}

export { ControlConstructor };
