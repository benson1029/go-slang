/**
 * CONTROL_select
 * Fields    : number of children
 * Children  :
 * - 4 bytes * num_cases: addresses of ControlCase objects
 */

import { Heap } from "../../heap";
import { auto_cast } from "../auto_cast";
import { HeapObject } from "../objects";
import { TAG_CONTROL_select } from "../tags";
import { ControlCase } from "./case";

class ControlSelect extends HeapObject {
  public get_case(index: number): ControlCase {
    if (this.get_tag() !== TAG_CONTROL_select) {
      throw new Error("ControlSelect.get_case: invalid tag");
    }
    return auto_cast(this.heap, this.get_child(index)) as ControlCase;
  }

  public get_number_of_cases(): number {
    return this.get_number_of_children();
  }

  public static allocate(heap: Heap, body: any[]): number {
    const address = heap.allocate_object(TAG_CONTROL_select, 1, body.length);

    for (let i = 0; i < body.length; i++) {
      const case_address = heap.allocate_any(body[i]);
      heap.set_child(address, i, case_address);
    }

    return address;
  }

  public stringify_i(): string {
    let result = this.address.toString() + " (select): ";
    for (let i = 0; i < this.get_number_of_cases(); i++) {
      result += this.get_child(i).toString() + " ";
    }
    return result;
  }
}

export { ControlSelect };
