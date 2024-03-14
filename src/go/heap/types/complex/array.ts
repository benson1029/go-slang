/**
 * COMPLEX_array
 * Fields    : number of children (length of the array)
 * Children  :
 * - addresses of the value (any)
 */

import { Heap } from "../../heap";
import { auto_cast } from "../auto_cast";
import { HeapObject } from "../objects";
import { PrimitiveNil } from "../primitive/nil";
import { TAG_COMPLEX_array } from "../tags";

class ComplexArray extends HeapObject {
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
}

export { ComplexArray };
