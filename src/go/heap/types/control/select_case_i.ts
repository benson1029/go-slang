/**
 * CONTROL_select_case_i
 * Fields    : number of children
 * Children  :
 * - 4 bytes address of the case channel statement
 * - 4 bytes address of the body
 */

import { Heap } from "../../heap";
import { auto_cast } from "../auto_cast";
import { HeapObject } from "../objects";
import { TAG_CONTROL_select_case_i } from "../tags";

class ControlSelectCaseI extends HeapObject {
  public get_case_channel_stmt(): HeapObject {
    return auto_cast(this.heap, this.get_child(0));
  }

  public get_body(): HeapObject {
    return auto_cast(this.heap, this.get_child(1));
  }

  public static allocate(
    heap: Heap,
    case_channel_stmt: HeapObject,
    body: HeapObject
  ): number {
    const address = heap.allocate_object(TAG_CONTROL_select_case_i, 1, 2);
    heap.set_child(address, 0, case_channel_stmt.reference().address);
    heap.set_child(address, 1, body.reference().address);
    return address;
  }

  public stringify_i(): string {
    let result = "";
    result += this.address.toString() + " (CONTROL_select_case_i)\n";
    result +=
      "  case_channel_stmt: " + this.get_case_channel_stmt().stringify() + "\n";
    result += "  body: " + this.get_body().stringify() + "\n";
    return result;
  }
}

export { ControlSelectCaseI };
