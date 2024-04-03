/**
 * CONTROL_push_i
 * Fields    :
 * - number of children
 * Children  :
 * - 4 bytes address of the object (any)
 */

import { Heap } from "../../heap";
import { HeapObject } from "../objects";
import { TAG_CONTROL_push_i } from "../tags";

class ControlPushI extends HeapObject {
  public get_object_address(): number {
    if (this.get_tag() !== TAG_CONTROL_push_i) {
      throw new Error("Invalid tag for ControlPushI");
    }
    return this.get_child(0);
  }

  public get_object(): HeapObject {
    if (this.get_tag() !== TAG_CONTROL_push_i) {
      throw new Error("Invalid tag for ControlPushI");
    }
    return new HeapObject(this.heap, this.get_object_address());
  }

  public static allocate(heap: Heap, object: HeapObject): number {
    const address = heap.allocate_object(TAG_CONTROL_push_i, 1, 1);
    heap.set_child(address, 0, object.reference().address);
    return address;
  }

  public stringify_i(): string {
    return "[" + this.get_object().stringify_i() + "] (push_i)";
  }
}

export { ControlPushI };
