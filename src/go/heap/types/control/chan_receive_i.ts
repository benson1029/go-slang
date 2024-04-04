/**
 * CONTROL_chan_receive_i
 */

import { Heap } from "../../heap";
import { HeapObject } from "../objects";
import { TAG_CONTROL_chan_receive_i } from "../tags";

class ControlChanReceiveI extends HeapObject {
  public static allocate(heap: Heap) {
    const address = heap.allocate_object(TAG_CONTROL_chan_receive_i, 0, 0);
    return address;
  }

  public stringify_i(): string {
    let result = "";
    result += this.address.toString() + " (chan_receive_i): ";
    return result;
  }
}

export { ControlChanReceiveI };
