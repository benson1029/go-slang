/**
 * USER_type
 * Fields    :
 * - number of children
 * Children  :
 * - 4 bytes address of the name of the type (COMPLEX_string)
 */

import { auto_cast } from "../../auto_cast";
import { ComplexString } from "../../complex/string";
import { HeapObject } from "../../objects";
import { UserVariable } from "../variable";

abstract class UserType extends HeapObject {
  public get_name(): ComplexString {
    return new ComplexString(this.heap, this.get_child(0));
  }

  public construct_default(variable: UserVariable): void {
    return (auto_cast(this.heap, this.address) as UserType).construct_default_i(
      variable
    );
  }

  public abstract construct_default_i(variable: UserVariable): void;
}

export { UserType };
