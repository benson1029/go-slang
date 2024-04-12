/**
 * CONTROL_slice
 * Fields    :
 * - number of children
 * Children  :
 * - 4 bytes address of the array (expression)
 * - 4 bytes address of the start index (expression)
 * - 4 bytes address of the end index (expression)
 */

import { Heap } from "../../heap";
import { auto_cast } from "../auto_cast";
import { HeapObject } from "../objects";
import { TAG_CONTROL_slice } from "../tags";

class ControlSlice extends HeapObject {
  public get_array_address(): number {
    if (this.get_tag() !== TAG_CONTROL_slice) {
      throw new Error("Invalid tag for ControlSlice");
    }
    return this.get_child(0);
  }

  public get_array(): HeapObject {
    if (this.get_tag() !== TAG_CONTROL_slice) {
      throw new Error("Invalid tag for ControlSlice");
    }
    return auto_cast(this.heap, this.get_array_address());
  }

  public get_start_index_address(): number {
    if (this.get_tag() !== TAG_CONTROL_slice) {
      throw new Error("Invalid tag for ControlSlice");
    }
    return this.get_child(1);
  }

  public get_start_index(): HeapObject {
    if (this.get_tag() !== TAG_CONTROL_slice) {
      throw new Error("Invalid tag for ControlSlice");
    }
    return auto_cast(this.heap, this.get_start_index_address());
  }

  public get_end_index_address(): number {
    if (this.get_tag() !== TAG_CONTROL_slice) {
      throw new Error("Invalid tag for ControlSlice");
    }
    return this.get_child(2);
  }

  public get_end_index(): HeapObject {
    if (this.get_tag() !== TAG_CONTROL_slice) {
      throw new Error("Invalid tag for ControlSlice");
    }
    return auto_cast(this.heap, this.get_end_index_address());
  }

  public static allocate(heap: Heap, array: any, start: any, end: any): number {
    const address = heap.allocate_object(TAG_CONTROL_slice, 1, 3);

    const array_address = heap.allocate_any(array);
    heap.set_child(address, 0, array_address);

    const start_address = heap.allocate_any(start);
    heap.set_child(address, 1, start_address);

    const end_address = heap.allocate_any(end);
    heap.set_child(address, 2, end_address);

    return address;
  }

  public to_object(): any {
    return this.get_array().to_object() + "[" + this.get_start_index().to_object() + ":" + this.get_end_index().to_object() + "]";
  }
}

export { ControlSlice };
