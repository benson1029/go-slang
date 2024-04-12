/**
 * CONTROL_case_receive
 * Fields    : number of children
 * Children  :
 * - address of body
 * - address of channel (CONTROL_name_address)
 * - address of assign expression (CONTROL_name_address)
 */

import { Heap } from "../../heap";
import { auto_cast } from "../auto_cast";
import { HeapObject } from "../objects";
import { TAG_CONTROL_case_receive, TAG_PRIMITIVE_nil } from "../tags";
import { ControlCase } from "./case";

class ControlCaseReceive extends ControlCase {
  public is_default(): boolean {
    return false;
  }

  public is_send(): boolean {
    return false;
  }

  public is_receive(): boolean {
    return true;
  }

  public get_body_address(): HeapObject {
    return auto_cast(this.heap, this.get_child(0));
  }

  public get_channel_address(): HeapObject {
    return auto_cast(this.heap, this.get_child(1));
  }

  public get_assign_address(): HeapObject {
    return auto_cast(this.heap, this.get_child(2));
  }

  public static allocate(
    heap: Heap,
    body: any,
    channel: any,
    assign: any
  ): number {
    const address = heap.allocate_object(TAG_CONTROL_case_receive, 1, 3);

    // After case_receive, the received value is pushed to the stash.
    // We need to add a pop_i command to pop the value from the stash.
    const pop_i_cmd = heap.allocate_any({ tag: "pop_i" });
    const body_address = heap.allocate_any({
      tag: "sequence",
      body: [
        pop_i_cmd,
        body,
      ]
    });
    heap.set_child(address, 0, body_address);
    heap.free_object(pop_i_cmd);

    const channel_address = heap.allocate_any(channel);
    heap.set_child(address, 1, channel_address);
    const assign_address = heap.allocate_any(assign);
    heap.set_child(address, 2, assign_address);
    return address;
  }

  public to_object(): any {
    let result = "case ";
    if (this.get_assign_address().get_tag() !== TAG_PRIMITIVE_nil) {
      result += this.get_assign_address().to_object() + " = ";
    }
    result += "<-" + this.get_channel_address().to_object() + ": " + this.get_body_address().to_object();
    return result;
  }
}

export { ControlCaseReceive };
