/**
 * COMPLEX_string
 * Fields    : number of children
 * Children  : characters of the string (each PRIMITIVE_rune)
 *
 * @param str string value
 * @returns address of the object
 */

import { Heap } from "../../heap";
import { HeapObject } from "../objects";
import { PrimitiveRune } from "../primitive/rune";
import { TAG_COMPLEX_string } from "../tags";

class ComplexString extends HeapObject {
  public get_string(): string {
    let str = "";
    for (let i = 0; i < this.get_number_of_children(); i++) {
      const rune = new PrimitiveRune(this.heap, this.get_child(i));
      str += String.fromCodePoint(rune.get_value());
    }
    return str;
  }

  public static allocate(heap: Heap, str: string): number {
    const address = heap.allocate_object(TAG_COMPLEX_string, 1, str.length);
    heap.set_cannnot_be_freed(address, true);

    for (let i = 0; i < str.length; i++) {
      const rune = heap.allocate_PRIMITIVE_rune(str.codePointAt(i));
      heap.set_cannnot_be_freed(rune, true);
      heap.set_child(address, i, rune);
    }

    // Unmark cannot-be-free
    heap.set_cannnot_be_freed(address, false);
    for (let i = 0; i < str.length; i++) {
      const rune = heap.get_child(address, i);
      heap.set_cannnot_be_freed(rune, false);
    }

    return address;
  }
}

export { ComplexString };
