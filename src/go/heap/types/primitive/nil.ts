/**
 * PRIMITIVE_nil
 * Fields    : None
 * Children  : None
 */

import { Primitive } from ".";

class PrimitiveNil extends Primitive {
  public get_type(): string {
    if (this.address !== PrimitiveNil.allocate()) {
      throw new Error("PrimitiveNil.get_type: Invalid address");
    }
    return "nil";
  }

  public get_value(): null {
    if (this.address !== PrimitiveNil.allocate()) {
      throw new Error("PrimitiveNil.get_value: Invalid address");
    }
    return null;
  }

  public copy(): PrimitiveNil {
    if (this.address !== PrimitiveNil.allocate()) {
      throw new Error("PrimitiveNil.copy: Invalid address");
    }
    return this;
  }

  public static allocate(): number {
    return 0;
  }

  public stringify_i(): string {
    return this.address.toString() + " (nil)";
  }
}

export { PrimitiveNil };
