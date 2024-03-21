/**
 * PRIMITIVE_undefined
 * Fields    : None
 * Children  : None
 */

import { Primitive } from ".";
import { WORD_SIZE } from "../../alloc";

class PrimitiveUndefined extends Primitive {
  public get_type(): string {
    if (this.address !== PrimitiveUndefined.allocate()) {
      throw new Error("PrimitiveUndefined.get_type: Invalid address");
    }
    return "undefined";
  }

  public get_value(): undefined {
    if (this.address !== PrimitiveUndefined.allocate()) {
      throw new Error("PrimitiveUndefined.get_value: Invalid address");
    }
    return undefined;
  }

  public copy(): PrimitiveUndefined {
    if (this.address !== PrimitiveUndefined.allocate()) {
      throw new Error("PrimitiveUndefined.copy: Invalid address");
    }
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
