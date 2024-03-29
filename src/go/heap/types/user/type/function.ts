/**
 * USER_type_function
 * Fields    :
 * - number of children
 * - number of parameters
 * Children  :
 * - 4 bytes address of the name (COMPLEX_string)
 * - 4 bytes address of the return type (USER_type)
 * - 4 bytes * number of parameters addresses of the parameters (USER_type)
 */

import { UserType } from ".";
import { Heap } from "../../../heap";
import { auto_cast } from "../../auto_cast";
import { ComplexString } from "../../complex/string";
import { PrimitiveNil } from "../../primitive/nil";
import { TAG_USER_type_function } from "../../tags";

import { UserVariable } from "../variable";

class UserTypeFunction extends UserType {
  public get_return_type(): UserType {
    return auto_cast(this.heap, this.get_child(1)) as UserType;
  }

  public get_number_of_parameters(): number {
    return this.get_number_of_children() - 2;
  }

  public get_parameter_type(index: number): UserType {
    if (index < 0 || index >= this.get_number_of_parameters()) {
      throw new Error("UserTypeFunction.get_parameter: Index out of range");
    }
    return auto_cast(this.heap, this.get_child(2 + index)) as UserType;
  }

  public construct_default_i(variable: UserVariable): void {
    if (this.get_tag() !== TAG_USER_type_function) {
      throw new Error("UserTypeFunction.construct_default: Invalid tag");
    }
    const value = PrimitiveNil.allocate_default(this.heap);
    variable.set_value(value);
    value.free();
  }

  public static allocate(
    heap: Heap,
    params: UserType[],
    returnType: UserType
  ): number {
    const address = heap.allocate_object(
      TAG_USER_type_function,
      1,
      2 + params.length
    );
    const name_address = ComplexString.allocate(
      heap,
      "func(" +
        params.map((p) => p.get_name().get_string()).join(", ") +
        ") " +
        returnType.get_name().get_string()
    );
    heap.set_child(address, 0, name_address);
    heap.set_child(address, 1, returnType.reference().address);
    for (let i = 0; i < params.length; i++) {
      heap.set_child(address, 2 + i, params[i].reference().address);
    }
    return address;
  }

  public stringify_i(): string {
    return this.get_name().get_string();
  }
}

export { UserTypeFunction };
