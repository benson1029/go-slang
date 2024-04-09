/**
 * CONTROL_index
 * Fields    : number of children
 * Children  :
 * - 4 bytes address of the array (expression)
 * - 4 bytes address of the index (expression)
 */

import { Heap } from "../../heap";
import { auto_cast } from "../auto_cast";
import { HeapObject } from "../objects";
import { TAG_CONTROL_index } from "../tags";

class ControlIndex extends HeapObject {
  public get_array_address(): number {
    if (this.get_tag() !== TAG_CONTROL_index) {
      throw new Error("Invalid tag for ControlIndex");
    }
    return this.get_child(0);
  }

  public get_array(): HeapObject {
    if (this.get_tag() !== TAG_CONTROL_index) {
      throw new Error("Invalid tag for ControlIndex");
    }
    return auto_cast(this.heap, this.get_array_address());
  }

  public get_index_address(): number {
    if (this.get_tag() !== TAG_CONTROL_index) {
      throw new Error("Invalid tag for ControlIndex");
    }
    return this.get_child(1);
  }

  public get_index(): HeapObject {
    if (this.get_tag() !== TAG_CONTROL_index) {
      throw new Error("Invalid tag for ControlIndex");
    }
    return auto_cast(this.heap, this.get_index_address());
  }

  public static allocate(heap: Heap, array: any, index: any): number {
    const address = heap.allocate_object(TAG_CONTROL_index, 2, 2);
    heap.set_cannnot_be_freed(address, true);

    const array_address = heap.allocate_any(array);
    heap.set_cannnot_be_freed(array_address, true);

    const index_address = heap.allocate_any(index);
    heap.set_cannnot_be_freed(index_address, true);

    heap.set_child(address, 0, array_address);
    heap.set_child(address, 1, index_address);

    // Unmark cannot-be-free
    heap.set_cannnot_be_freed(address, false);
    heap.set_cannnot_be_freed(array_address, false);
    heap.set_cannnot_be_freed(index_address, false);

    return address;
  }

  public to_object(): any {
    return this.get_array().to_object() + "[" + this.get_index().to_object() + "]";
  }
}

export { ControlIndex };
