/**
 * CONTROL_chan_send
 * Fields    : number of children
 * Children  :
 * - 4 bytes address of the name of the channel (COMPLEX_string)
 * - 4 bytes address of the value to send
 */

import { Heap } from "../../heap";
import { auto_cast } from "../auto_cast";
import { HeapObject } from "../objects";
import { TAG_CONTROL_chan_send } from "../tags";

class ControlChanSend extends HeapObject {
  public get_name_address(): HeapObject {
    return auto_cast(this.heap, this.get_child(0));
  }

  public get_value_address(): HeapObject {
    return auto_cast(this.heap, this.get_child(1));
  }

  public static allocate(heap: Heap, name: any, value: any) {
    const address = heap.allocate_object(TAG_CONTROL_chan_send, 1, 2);

    const name_address = heap.allocate_any(name);
    heap.set_child(address, 0, name_address);

    const value_address = heap.allocate_any(value);
    heap.set_child(address, 1, value_address);

    return address;
  }

  public stringify_i(): string {
    let result = "";
    result += this.address.toString() + " (chan_send): ";
    result += this.get_name_address().stringify();
    return result;
  }

  public to_object(): any {
    return this.get_name_address().to_object() + " <- " + this.get_value_address().to_object();
  }
}

export { ControlChanSend };
