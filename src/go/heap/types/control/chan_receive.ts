/**
 * CONTROL_chan_receive
 * Fields    : number of children
 * Children  :
 * - 4 bytes address of the name of the channel (COMPLEX_string)
 */

import { Heap } from "../../heap";
import { auto_cast } from "../auto_cast";
import { HeapObject } from "../objects";
import { TAG_CONTROL_chan_receive } from "../tags";

class ControlChanReceive extends HeapObject {
  public get_name_address(): HeapObject {
    return auto_cast(this.heap, this.get_child(0));
  }

  public static allocate(heap: Heap, name: any) {
    const address = heap.allocate_object(TAG_CONTROL_chan_receive, 1, 1);
    heap.set_cannnot_be_freed(address, true);

    const name_address = heap.allocate_any(name);
    heap.set_cannnot_be_freed(name_address, true);

    heap.set_child(address, 0, name_address);

    // Unmark cannot-be-free
    heap.set_cannnot_be_freed(address, false);
    heap.set_cannnot_be_freed(name_address, false);

    return address;
  }

  public stringify_i(): string {
    let result = "";
    result += this.address.toString() + " (chan_receive): ";
    result += this.get_name_address().stringify();
    return result;
  }
}

export { ControlChanReceive };
