/**
 * CONTROL_call_i
 * Fields    : number of children
 * Children  :
 * - 4 bytes address of the number of arguments (PRIMITIVE_number)
 */

import { Heap } from "../../heap";
import { HeapObject } from "../objects";
import { PrimitiveInt32 } from "../primitive/int32";
import { TAG_CONTROL_call_i } from "../tags";

class ControlCallI extends HeapObject {
  public get_number_of_args_address(): PrimitiveInt32 {
    // Guarantee: number_of_args is not nil
    return new PrimitiveInt32(this.heap, this.get_child(0));
  }

  public get_number_of_args(): number {
    return this.get_number_of_args_address().get_value();
  }

  public static allocate(heap: Heap, number_of_args: number): number {
    const address = heap.allocate_object(TAG_CONTROL_call_i, 1, 1);
    heap.set_cannnot_be_freed(address, true);

    const number_of_args_address = heap.allocate_any({ tag: "int32", value: number_of_args });
    heap.set_cannnot_be_freed(number_of_args_address, true);

    heap.set_child(address, 0, number_of_args_address);

    // Unmark cannot-be-free
    heap.set_cannnot_be_freed(address, false);
    heap.set_cannnot_be_freed(number_of_args_address, false);

    return address;
  }

  public stringify_i(): string {
    return this.address.toString() + " (call_i): " + this.get_number_of_args_address().stringify();
  }

  public to_object(): any {
    return "CALL_I " + this.get_number_of_args();
  }
}

export { ControlCallI };
