/**
 * CONTROL_return
 * Children  :
 * - 4 bytes address of the value (expression)
 */

import { Heap } from "../../heap";
import { auto_cast } from "../auto_cast";
import { HeapObject } from "../objects";
import { TAG_CONTROL_return } from "../tags";

class ControlReturn extends HeapObject {
  public get_expression_address(): HeapObject {
    return auto_cast(this.heap, this.get_child(0));
  }

  public static allocate(heap: Heap, value: any): number {
    const address = heap.allocate_object(TAG_CONTROL_return, 1, 1);

    const value_address = heap.allocate_any(value);
    heap.set_child(address, 0, value_address);

    return address;
  }

  public stringify_i(): string {
    return this.address.toString() + " (return): " + this.get_expression_address().stringify();
  }

  public to_object(): any {
    return "return " + this.get_expression_address().to_object();
  }
}

export { ControlReturn };
