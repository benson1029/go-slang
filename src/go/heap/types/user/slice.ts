/**
 * USER_slice
 * Fields    :
 * - number of children
 * - length of the slice
 * - capacity of the slice
 * - offset of the slice
 * Children  :
 * - 4 bytes address of the underlying array (USER_array)
 */

import { Heap } from "../../heap";
import { TAG_USER_slice } from "../tags";
import { HeapObject } from "../objects";
import { ComplexArray } from "../complex/array";
import { UserVariable } from "./variable";

class UserSlice extends HeapObject {
  public get_length(): number {
    return this.get_field(1);
  }

  public get_capacity(): number {
    return this.get_field(2);
  }

  public get_offset(): number {
    return this.get_field(3);
  }

  public get_underlying_array(): ComplexArray {
    return new ComplexArray(this.heap, this.get_child(0));
  }

  public static allocate(heap: Heap, len: number, cap: number, offset: number, arr: ComplexArray): number {
    const address = heap.allocate_object(TAG_USER_slice, 4, 1);

    heap.set_field(address, 1, len);
    heap.set_field(address, 2, cap);
    heap.set_field(address, 3, offset);
    heap.set_child(address, 0, arr.reference().address);

    return address;
  }

  public stringify_i(): string {
    return "slice (" + this.get_length() + "/" + this.get_capacity() + ")"
        + " of " + this.get_underlying_array().stringify_i() + " at " + this.get_offset();
  }

  public to_object(): any {
    let result = "(" + this.get_length() + "/" + this.get_capacity() + ") [";
    for (let i = 0; i < this.get_length(); i++) {
      result += (this.get_underlying_array().get_value_address(i + this.get_offset()) as UserVariable).get_value().to_object();
      if (i + 1 < this.get_length()) {
        result += " ";
      }
    }
    result += "]";
    return result;
  }
}

export { UserSlice };
