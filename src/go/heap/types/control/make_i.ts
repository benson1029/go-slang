/**
 * CONTROL_make_i
 * Fields    :
 * - number of children
 * Children  :
 * - 4 bytes address of the type (USER_type)
 * - 4 bytes number of arguments (PRIMITIVE_int32)
 */

import { Heap } from "../../../heap";
import { auto_cast } from "../auto_cast";
import { HeapObject } from "../objects";
import { PrimitiveInt32 } from "../primitive/int32";
import { TAG_CONTROL_make_i } from "../tags";
import { UserType } from "../user/type";

class ControlMakeI extends HeapObject {
  public get_type(): UserType {
    return auto_cast(this.heap, this.get_child(0)) as UserType;
  }

  public get_number_of_arguments(): number {
    return (
      auto_cast(this.heap, this.get_child(1)) as PrimitiveInt32
    ).get_value();
  }

  public static allocate(heap: Heap, type: UserType, num_args: number): number {
    const address = heap.allocate_object(TAG_CONTROL_make_i, 1, 2);

    heap.set_child(address, 0, type.reference().address);

    const number_address = heap.allocate_PRIMITIVE_int32(num_args);
    heap.set_child(address, 1, number_address);

    return address;
  }

  public stringify_i(): string {
    let result = "";
    result += this.address.toString() + " (make_i): ";
    result += this.get_type().stringify() + " ";
    result += this.get_number_of_arguments().toString();
    return result;
  }

  public to_object(): any {
    return "MAKE_I " + this.get_type().to_object() + " " + this.get_number_of_arguments().toString();
  }
}

export { ControlMakeI };
