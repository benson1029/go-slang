/**
 * ENVIRONMENT_entry
 * Fields    : number of children
 * Children  : 
 * - address of the key (COMPLEX_string)
 * - address of the value (any)
 */

import { Heap } from "../../heap";
import { auto_cast } from "../auto_cast";
import { ComplexString } from "../complex/string";
import { HeapObject } from "../objects";
import { PrimitiveNil } from "../primitive/nil";
import { TAG_ENVIRONMENT_entry } from "../tags";

class EnvironmentEntry extends HeapObject {
  public get_key_address(): ComplexString {
    if (this.get_tag() !== TAG_ENVIRONMENT_entry) {
      throw new Error("EnvironmentEntry.get_key_address: Invalid tag");
    }
    // Guarantee: key is not null
    return new ComplexString(this.heap, this.get_child(0));
  }

  public get_value_address(): HeapObject {
    if (this.get_tag() !== TAG_ENVIRONMENT_entry) {
      throw new Error("EnvironmentEntry.get_value_address: Invalid tag");
    }
    return auto_cast(this.heap, this.get_child(1));
  }
  
  /**
   * Important: This method will call reference() on the value and free() the old value.
   * @param value_address 
   */
  public set_value_address(value_address: number): void {
    if (this.get_tag() !== TAG_ENVIRONMENT_entry) {
      throw new Error("EnvironmentEntry.set_value_address: Invalid tag");
    }
    const value = auto_cast(this.heap, value_address);
    const old_value = this.get_value_address();
    this.set_child(1, value.reference().address);
    old_value.free();
  }

  public static allocate(heap: Heap, key_address: number, value_address: number): number {
    const key = new ComplexString(heap, key_address);
    const value = auto_cast(heap, value_address);

    key.set_cannnot_be_freed(true);
    value.set_cannnot_be_freed(true);

    const address = heap.allocate_object(TAG_ENVIRONMENT_entry, 1, 2);
    heap.set_child(address, 0, key.reference().address);
    heap.set_child(address, 1, value.reference().address);

    key.set_cannnot_be_freed(false);
    value.set_cannnot_be_freed(false);

    return address;
  }

  public static allocate_nil(heap: Heap): EnvironmentEntry {
    return new EnvironmentEntry(heap, PrimitiveNil.allocate());
  }

  public stringify_i(): string {
    let result = "";
    result += this.address.toString() + " (environment entry): ";
    result += this.get_key_address().stringify();
    result += " -> ";
    result += this.get_value_address().stringify();
    return result;
  }
}

export { EnvironmentEntry };
