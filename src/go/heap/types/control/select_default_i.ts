/**
 * CONTROL_select_default_i
 * Fields    : number of children
 * Children  :
 * - 4 bytes address of the body (block)
 */

import { Heap } from "../../heap";
import { auto_cast } from "../auto_cast";
import { HeapObject } from "../objects";
import { TAG_CONTROL_select_default_i } from "../tags";

class ControlSelectDefaultI extends HeapObject {
  public get_body_address(): HeapObject {
    return auto_cast(this.heap, this.get_child(0));
  }

  public static allocate(heap: Heap, body: HeapObject): number {
    const address = heap.allocate_object(TAG_CONTROL_select_default_i, 1, 1);
    heap.set_child(address, 0, body.reference().address);
    return address;
  }

  public stringify_i(): string {
    let result = "";
    result += this.address.toString() + " (select_default_i): ";
    result += "body: " + this.get_body_address().stringify();
    return result;
  }
}

export { ControlSelectDefaultI };
