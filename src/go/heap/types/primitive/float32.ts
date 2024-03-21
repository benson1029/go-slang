/**
 * PRIMITIVE_float32
 * Fields    : float32 value
 * Children  : None
 */

import { Primitive } from ".";
import { WORD_SIZE } from "../../alloc";
import { Heap } from "../../heap";
import { TAG_PRIMITIVE_float32 } from "../tags";

class PrimitiveFloat32 extends Primitive {
  private static word_to_float32(word: number): number {
    const view = new DataView(new ArrayBuffer(WORD_SIZE));
    view.setUint32(0, word);
    return view.getFloat32(0);
  }

  private static float32_to_word(float32: number): number {
    const view = new DataView(new ArrayBuffer(WORD_SIZE));
    view.setFloat32(0, float32);
    return view.getUint32(0);
  }

  public get_type(): string {
    return "float32";
  }

  public get_value(): number {
    return PrimitiveFloat32.word_to_float32(this.heap.get_field(this.address, 0));
  }

  public static allocate(heap: Heap, value: number): number {
    const address = heap.allocate_object(TAG_PRIMITIVE_float32, 1, 0);
    heap.set_field(address, 0, PrimitiveFloat32.float32_to_word(value));
    return address;
  }

  public stringify_i(): string {
    return this.address.toString() + " (float32): " + this.get_value().toString();
  }
}

export { PrimitiveFloat32 };
