/**
 * COMPLEX_builtin
 * Fields    : number of children
 * Children  :
 * - 4 bytes address of the function name (COMPLEX_string)
 */

import { Heap } from "../../heap";
import { ComplexString } from "../complex/string";
import { HeapObject } from "../objects";
import { TAG_COMPLEX_builtin } from "../tags";

class ComplexBuiltin extends HeapObject {
  public get_name_address(): ComplexString {
    if (this.get_tag() !== TAG_COMPLEX_builtin) {
      throw new Error("Invalid tag for ComplexBuiltin");
    }
    // Guarantee: name is not nil
    return new ComplexString(this.heap, this.get_child(0));
  }

  public get_name(): string {
    if (this.get_tag() !== TAG_COMPLEX_builtin) {
      throw new Error("Invalid tag for ComplexBuiltin");
    }
    return this.get_name_address().get_string();
  }

  public static allocate(heap: Heap, name: string): number {
    const address = heap.allocate_object(TAG_COMPLEX_builtin, 1, 1);

    const name_address = ComplexString.allocate(heap, name);
    heap.set_child(address, 0, name_address);

    return address;
  }

  public static allocate_default(heap: Heap): ComplexBuiltin {
    const address = this.allocate(heap, "");
    return new ComplexBuiltin(heap, address);
  }

  public stringify_i(): string {
    return this.address.toString() + " (builtin): " + this.get_name();
  }

  public to_object(): any {
    return this.get_name() + " (builtin)";
  }
}

export { ComplexBuiltin };
