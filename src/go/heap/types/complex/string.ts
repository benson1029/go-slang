/**
 * COMPLEX_string
 * Fields    : number of children, hash of the string
 * Children  : characters of the string (each PRIMITIVE_rune)
 */

import { Heap } from "../../heap";
import { HeapObject } from "../objects";
import { PrimitiveRune } from "../primitive/rune";
import { TAG_COMPLEX_string } from "../tags";

function hash_string(str: string): number {
  const mod = 1000000007;
  const base = 37;
  const multiplier = 6661111;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * multiplier + (base + str.codePointAt(i))) % mod;
  };
  return hash;
}

class ComplexString extends HeapObject {
  public get_string(): string {
    if (this.get_tag() !== TAG_COMPLEX_string) {
      throw new Error("ComplexString.get_string: Invalid tag");
    }
    let str = "";
    for (let i = 0; i < this.get_length(); i++) {
      const rune = new PrimitiveRune(this.heap, this.get_child(i));
      str += String.fromCodePoint(rune.get_value());
    }
    return str;
  }

  public get_length(): number {
    if (this.get_tag() !== TAG_COMPLEX_string) {
      throw new Error("ComplexString.get_length: Invalid tag");
    }
    return this.get_number_of_children();
  }

  public get_hash(): number {
    if (this.get_tag() !== TAG_COMPLEX_string) {
      throw new Error("ComplexString.get_hash: Invalid tag");
    }
    return this.get_field(1);
  }

  public static allocate(heap: Heap, str: string): number {
    const address = heap.allocate_object(TAG_COMPLEX_string, 2, str.length);

    for (let i = 0; i < str.length; i++) {
      const rune = PrimitiveRune.allocate(heap, str.codePointAt(i));
      heap.set_child(address, i, rune);
    }

    heap.set_field(address, 1, hash_string(str));

    return address;
  }

  public static allocate_default(heap: Heap): ComplexString {
    const address = this.allocate(heap, "");
    return new ComplexString(heap, address);
  }

  public stringify_i(): string {
    return this.address.toString() + " (string): " + this.get_string();
  }

  public to_object(): any {
    return this.get_string();
  }
}

export { ComplexString };
