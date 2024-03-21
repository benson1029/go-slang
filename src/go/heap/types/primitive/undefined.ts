/**
 * PRIMITIVE_undefined
 * Fields    : None
 * Children  : None
 */

import { Primitive } from ".";
import { WORD_SIZE } from "../../alloc";

class PrimitiveUndefined extends Primitive {
  public get_type(): string {
    return "undefined";
  }

  public get_value(): undefined {
    return undefined;
  }

  public copy(): PrimitiveUndefined {
    return this;
  }

  public static allocate(): number {
    return 2 * WORD_SIZE;
  }

  public stringify_i(): string {
    return this.address.toString() + " (undefined)";
  }
}

export { PrimitiveUndefined };
