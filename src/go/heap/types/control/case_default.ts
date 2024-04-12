/**
 * CONTROL_case_default
 * Fields    : number of children
 * Children  :
 * - address of body
 */

import { Heap } from "../../heap";
import { auto_cast } from "../auto_cast";
import { HeapObject } from "../objects";
import { TAG_CONTROL_case_default } from "../tags";
import { ControlCase } from "./case";

class ControlCaseDefault extends ControlCase {
  public is_default(): boolean {
    return true;
  }

  public is_send(): boolean {
    return false;
  }

  public is_receive(): boolean {
    return false;
  }

  public get_body_address(): HeapObject {
    return auto_cast(this.heap, this.get_child(0));
  }

  public static allocate(heap: Heap, body: any): number {
    const address = heap.allocate_object(TAG_CONTROL_case_default, 1, 1);
    const body_address = heap.allocate_any(body);
    heap.set_child(address, 0, body_address);
    return address;
  }

  public to_object(): any {
    return "default: " + this.get_body_address().to_object();
  }
}

export { ControlCaseDefault };
