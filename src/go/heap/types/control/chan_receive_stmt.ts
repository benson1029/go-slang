/**
 * CONTROL_chan_receive_stmt
 * Fields    : number of children
 * Children  :
 * - 4 bytes address (CONTROL_chan_receive)
 */

import { Heap } from "../../heap";
import { auto_cast } from "../auto_cast";
import { HeapObject } from "../objects";
import { TAG_CONTROL_chan_receive_stmt } from "../tags";
import { ControlChanReceive } from "./chan_receive";

class ControlChanReceiveStmt extends HeapObject {
  public get_body_address(): ControlChanReceive {
    return auto_cast(this.heap, this.get_child(0)) as ControlChanReceive;
  }

  public static allocate(heap: Heap, body: any) {
    const address = heap.allocate_object(TAG_CONTROL_chan_receive_stmt, 1, 1);
    heap.set_cannnot_be_freed(address, true);

    const body_address = heap.allocate_any(body);
    heap.set_child(address, 0, body_address);

    // Unmark cannot-be-free
    heap.set_cannnot_be_freed(address, false);

    return address;
  }

  public stringify_i(): string {
    let result = "";
    result += this.address.toString() + " (chan_receive_stmt): ";
    result += this.get_body_address().stringify();
    return result;
  }
}

export { ControlChanReceiveStmt };
