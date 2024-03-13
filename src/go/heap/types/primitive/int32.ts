/**
 * PRIMITIVE_int32
 * Fields    : int32 value
 * Children  : None
 *
 * @param value integer value
 * @returns address of the object
 */

import { Primitive } from ".";
import { WORD_SIZE } from "../../alloc";
import { Heap } from "../../heap";
import { TAG_PRIMITIVE_int32 } from "../tags";

class PrimitiveInt32 extends Primitive {
  private static word_to_int32(word: number): number {
    const view = new DataView(new ArrayBuffer(WORD_SIZE));
    view.setUint32(0, word);
    return view.getInt32(0);
  }

  private static int32_to_word(int32: number): number {
    const view = new DataView(new ArrayBuffer(WORD_SIZE));
    view.setInt32(0, int32);
    return view.getUint32(0);
  }

  public get_type(): string {
    return "int32";
  }

  public get_value(): number {
    return PrimitiveInt32.word_to_int32(this.heap.get_field(this.address, 0));
  }

  public static allocate(heap: Heap, value: number): number {
    const address = heap.allocate_object(TAG_PRIMITIVE_int32, 1, 0);
    heap.set_field(address, 0, PrimitiveInt32.int32_to_word(value));
    return address;
  }
}

export { PrimitiveInt32 };
