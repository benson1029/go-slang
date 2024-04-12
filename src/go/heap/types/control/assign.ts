/**
 * CONTROL_assign
 * Structure : [4 bytes metadata, 4 bytes reference count]
 * Fields    : number of children
 * Children  :
 * - 4 bytes address of the name (expression)
 * - 4 bytes address of the value (expression)
 */

import { Heap } from "../../heap";
import { auto_cast } from "../auto_cast";
import { HeapObject } from "../objects";
import { TAG_CONTROL_assign } from "../tags";

class ControlAssign extends HeapObject {
  public get_name_address(): number {
    // Guarantee: name is not nil
    return this.get_child(0);
  }

  public get_name(): HeapObject {
    return auto_cast(this.heap, this.get_name_address());
  }

  public get_expression_address(): number {
    return this.get_child(1);
  }

  public get_expression(): HeapObject {
    return auto_cast(this.heap, this.get_expression_address());
  }

  public static allocate(heap: Heap, name: any, value: any): number {
    const address = heap.allocate_object(TAG_CONTROL_assign, 1, 2);

    const name_address = heap.allocate_any(name);
    heap.set_child(address, 0, name_address);

    const value_address = heap.allocate_any(value);
    heap.set_child(address, 1, value_address);

    return address;
  }

  public stringify_i(): string {
    return this.address.toString() + " (assign): " + this.get_name().stringify();
  }

  public to_object(): any {
      return this.get_name().to_object() + " = " + this.get_expression().to_object();
  }
}

export { ControlAssign };
