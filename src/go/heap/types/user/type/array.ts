/**
 * USER_type_array
 * Fields    :
 * - number of children
 * - size of the array
 * Children  :
 * - 4 bytes address of the name (COMPLEX_string)
 * - 4 bytes address of the type of the array (USER_type)
 */

import { UserType } from ".";
import { Heap } from "../../../heap";
import { auto_cast } from "../../auto_cast";
import { ComplexArray } from "../../complex/array";
import { ComplexString } from "../../complex/string";
import { PrimitiveNil } from "../../primitive/nil";
import { TAG_USER_type_array } from "../../tags";
import { UserVariable } from "../variable";

class UserTypeArray extends UserType {
  public get_length(): number {
    return this.get_field(1);
  }

  public get_inner_type(): UserType {
    return auto_cast(this.heap, this.get_child(1)) as UserType;
  }

  public construct_default_i(variable: UserVariable): void {
    if (this.get_tag() !== TAG_USER_type_array) {
      throw new Error("UserTypeArray.construct_default: Invalid tag");
    }

    const len = this.get_length();
    const value_address = ComplexArray.allocate(this.heap, len);
    const value = new ComplexArray(this.heap, value_address);
    variable.set_value(value);
    value.free();

    // Default-construct each element
    const inner_type = this.get_inner_type();
    for (let i = 0; i < len; i++) {
      const inner_variable_address = UserVariable.allocate(
        this.heap,
        inner_type,
        PrimitiveNil.allocate_default(this.heap)
      );
      const inner_variable = new UserVariable(
        this.heap,
        inner_variable_address
      );
      value.set_value_address(i, inner_variable);
      inner_variable.free();
    }
  }

  public static allocate(heap: Heap, len: number, type: any): number {
    const address = heap.allocate_object(TAG_USER_type_array, 2, 2);

    heap.set_field(address, 1, len);

    const type_address = heap.allocate_any(type);
    heap.set_child(address, 1, type_address);

    const name_address = ComplexString.allocate(
      heap,
      "[" + len.toString() + "]" + (auto_cast(heap, type_address) as UserType).get_name().get_string()
    );
    heap.set_child(address, 0, name_address);
  
    return address;
  }

  public static reallocate(heap: Heap, len: number, type: UserType): number {
    const address = heap.allocate_object(TAG_USER_type_array, 2, 2);

    heap.set_field(address, 1, len);

    heap.set_child(address, 1, type.reference().address);

    const name_address = ComplexString.allocate(
      heap,
      "[" + len.toString() + "]" + type.get_name().get_string()
    );
    heap.set_child(address, 0, name_address);

    return address;
  }

  public stringify_i(): string {
    return this.get_name().get_string();
  }
}

export { UserTypeArray };
