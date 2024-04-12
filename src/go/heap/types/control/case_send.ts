/**
 * CONTROL_case_send
 * Fields    : number of children
 * Children  :
 * - address of body
 * - address of channel (CONTROL_name_address)
 * - address of value expression
 */

import { Heap } from "../../heap";
import { auto_cast } from "../auto_cast";
import { HeapObject } from "../objects";
import { TAG_CONTROL_case_send } from "../tags";
import { ControlCase } from "./case";

class ControlCaseSend extends ControlCase {
  public is_default(): boolean {
    return false;
  }

  public is_send(): boolean {
    return true;
  }

  public is_receive(): boolean {
    return false;
  }

  public get_body_address(): HeapObject {
    return auto_cast(this.heap, this.get_child(0));
  }

  public get_channel_address(): HeapObject {
    return auto_cast(this.heap, this.get_child(1));
  }

  public get_value_address(): HeapObject {
    return auto_cast(this.heap, this.get_child(2));
  }

  public static allocate(
    heap: Heap,
    body: any,
    channel: any,
    value: any,
  ): number {
    const address = heap.allocate_object(TAG_CONTROL_case_send, 1, 3);
    const body_address = heap.allocate_any(body);
    heap.set_child(address, 0, body_address);
    const channel_address = heap.allocate_any(channel);
    heap.set_child(address, 1, channel_address);
    const value_address = heap.allocate_any(value);
    heap.set_child(address, 2, value_address);
    return address;
  }

  public to_object(): any {
    return "case " + this.get_channel_address().to_object() + " <- " + this.get_value_address().to_object() + ": "
        + this.get_body_address().to_object();
  }
}

export { ControlCaseSend };
