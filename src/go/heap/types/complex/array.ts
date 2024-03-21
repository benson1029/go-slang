/**
 * COMPLEX_array
 * Fields    : number of children (length of the array)
 * Children  :
 * - addresses of the value (any)
 */

import { Heap } from "../../heap";
import { auto_cast } from "../auto_cast";
import { HeapObject } from "../objects";
import { TAG_COMPLEX_array } from "../tags";

class ComplexArray extends HeapObject {
  public set_value_address(index: number, value: HeapObject): void {
    const current_value_address = this.get_value_address(index);    
    this.set_child(index, value.reference().address);
    current_value_address.free();
  }

  public get_value_address(index: number): HeapObject {
    return auto_cast(this.heap, this.get_child(index));
  }

  public get_length(): number {
    return this.get_number_of_children();
  }

  public static allocate(heap: Heap, array_length: number): number {
    const address = heap.allocate_object(TAG_COMPLEX_array, 1, array_length);
    return address;
  }

  public stringify_i(): string {
    let result = "";
    result += this.address.toString() + " (array): ";
    result += "[";
    for (let i = 0; i < this.get_length(); i++) {
      result += this.get_value_address(i).stringify();
      if (i < this.get_length() - 1) {
        result += ", ";
      }
    }
    result += "]";
    return result;
  }
}

export { ComplexArray };
