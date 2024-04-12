/**
 * ENVIRONMENT_entry
 * Fields    : number of children
 * Children  :
 * - address of the key (COMPLEX_string)
 * - address of the value (any)
 */

import { Heap } from "../../heap";
import { ComplexString } from "../complex/string";
import { HeapObject } from "../objects";
import { PrimitiveNil } from "../primitive/nil";
import { TAG_ENVIRONMENT_entry } from "../tags";
import { UserVariable } from "../user/variable";

class EnvironmentEntry extends HeapObject {
  public get_key_address(): ComplexString {
    if (this.get_tag() !== TAG_ENVIRONMENT_entry) {
      throw new Error("EnvironmentEntry.get_key_address: Invalid tag");
    }
    // Guarantee: key is not null
    return new ComplexString(this.heap, this.get_child(0));
  }

  public get_variable_address(): UserVariable {
    if (this.get_tag() !== TAG_ENVIRONMENT_entry) {
      throw new Error("EnvironmentEntry.get_variable_address: Invalid tag");
    }
    return new UserVariable(this.heap, this.get_child(1));
  }

  /**
   * Important: This method calls reference() on the variable, and free() the old variable.
   * @param variable 
   */
  public set_variable_address(variable: UserVariable): void {
    if (this.get_tag() !== TAG_ENVIRONMENT_entry) {
      throw new Error("EnvironmentEntry.set_variable_address: Invalid tag");
    }
    const old_variable = this.get_variable_address();
    this.set_child(1, variable.reference().address);
    old_variable.free();
  }

  public static allocate(
    heap: Heap,
    key_address: number,
    variable_address: number
  ): number {
    const key = new ComplexString(heap, key_address);
    const variable = new UserVariable(heap, variable_address);

    const address = heap.allocate_object(TAG_ENVIRONMENT_entry, 1, 2);
    heap.set_child(address, 0, key.reference().address);
    heap.set_child(address, 1, variable.reference().address);

    return address;
  }

  public static allocate_nil(heap: Heap): EnvironmentEntry {
    return new EnvironmentEntry(heap, PrimitiveNil.allocate());
  }

  public stringify_i(): string {
    let result = "";
    result += this.address.toString() + " (environment entry): ";
    result += this.get_key_address().stringify();
    // result += " -> ";
    // result += this.get_variable_address().stringify();
    return result;
  }

  public to_object(): any {
    return {
      name: this.get_key_address().get_string(),
      value: this.get_variable_address().get_value().to_object(),
    }
  }
}

export { EnvironmentEntry };
