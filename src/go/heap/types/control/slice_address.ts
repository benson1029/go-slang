/**
 * CONTROL_slice_address
 * Fields    :
 * - number of children
 * Children  :
 * - 4 bytes address of the array (expression)
 * - 4 bytes address of the start index (expression)
 * - 4 bytes address of the end index (expression)
 */

import { Heap } from "../../heap";
import { HeapObject } from "../objects";
import { TAG_CONTROL_slice_address } from "../tags";

class ControlSliceAddress extends HeapObject {
  public get_array_address(): number {
    if (this.get_tag() !== TAG_CONTROL_slice_address) {
      throw new Error("Invalid tag for ControlSliceAddress");
    }
    return this.get_child(0);
  }

  public get_array(): HeapObject {
    if (this.get_tag() !== TAG_CONTROL_slice_address) {
      throw new Error("Invalid tag for ControlSliceAddress");
    }
    return new HeapObject(this.heap, this.get_array_address());
  }

  public get_start_index_address(): number {
    if (this.get_tag() !== TAG_CONTROL_slice_address) {
      throw new Error("Invalid tag for ControlSliceAddress");
    }
    return this.get_child(1);
  }

  public get_start_index(): HeapObject {
    if (this.get_tag() !== TAG_CONTROL_slice_address) {
      throw new Error("Invalid tag for ControlSliceAddress");
    }
    return new HeapObject(this.heap, this.get_start_index_address());
  }

  public get_end_index_address(): number {
    if (this.get_tag() !== TAG_CONTROL_slice_address) {
      throw new Error("Invalid tag for ControlSliceAddress");
    }
    return this.get_child(2);
  }

  public get_end_index(): HeapObject {
    if (this.get_tag() !== TAG_CONTROL_slice_address) {
      throw new Error("Invalid tag for ControlSliceAddress");
    }
    return new HeapObject(this.heap, this.get_end_index_address());
  }

  public static allocate(heap: Heap, array: any, start: any, end: any): number {
    const address = heap.allocate_object(TAG_CONTROL_slice_address, 1, 3);
    heap.set_cannnot_be_freed(address, true);
    const array_address = heap.allocate_any(array);
    heap.set_cannnot_be_freed(array_address, true);
    const start_address = heap.allocate_any(start);
    heap.set_cannnot_be_freed(start_address, true);
    const end_address = heap.allocate_any(end);
    heap.set_cannnot_be_freed(end_address, true);

    heap.set_child(address, 0, array_address);
    heap.set_child(address, 1, start_address);
    heap.set_child(address, 2, end_address);

    // Unmark cannot-be-free
    heap.set_cannnot_be_freed(address, false);
    heap.set_cannnot_be_freed(array_address, false);
    heap.set_cannnot_be_freed(start_address, false);
    heap.set_cannnot_be_freed(end_address, false);

    return address;
  }
}

export { ControlSliceAddress };
