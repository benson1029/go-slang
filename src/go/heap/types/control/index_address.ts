/**
 * CONTROL_index_address
 * Fields    : number of children
 * Children  :
 * - 4 bytes address of the array (expression)
 * - 4 bytes address of the index (expression)
 */

import { Heap } from "../../heap";
import { auto_cast } from "../auto_cast";
import { HeapObject } from "../objects";
import { TAG_CONTROL_index_address } from "../tags";

class ControlIndexAddress extends HeapObject {
  public get_array_address(): number {
    if (this.get_tag() !== TAG_CONTROL_index_address) {
      throw new Error("Invalid tag for ControlIndexAddress");
    }
    return this.get_child(0);
  }

  public get_array(): HeapObject {
    if (this.get_tag() !== TAG_CONTROL_index_address) {
      throw new Error("Invalid tag for ControlIndexAddress");
    }
    return auto_cast(this.heap, this.get_array_address());
  }

  public get_index_address(): number {
    if (this.get_tag() !== TAG_CONTROL_index_address) {
      throw new Error("Invalid tag for ControlIndexAddress");
    }
    return this.get_child(1);
  }

  public get_index(): HeapObject {
    if (this.get_tag() !== TAG_CONTROL_index_address) {
      throw new Error("Invalid tag for ControlIndexAddress");
    }
    return auto_cast(this.heap, this.get_index_address());
  }

  public static allocate(heap: Heap, array: any, index: any): number {
    const address = heap.allocate_object(TAG_CONTROL_index_address, 2, 2);

    const array_address = heap.allocate_any(array);
    heap.set_child(address, 0, array_address);

    const index_address = heap.allocate_any(index);
    heap.set_child(address, 1, index_address);

    return address;
  }

  public to_object(): any {
    return this.get_array().to_object() + "[" + this.get_index().to_object() + "]";
  }
}

export { ControlIndexAddress };
