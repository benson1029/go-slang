/**
 * PRIMITIVE_nil
 * Fields    : None
 * Children  : None
 */

import { Primitive } from ".";

class PrimitiveNil extends Primitive {
  public get_type(): string {
    return "nil";
  }

  public get_value(): null {
    return null;
  }

  public copy(): PrimitiveNil {
    return this;
  }

  public static allocate(): number {
    return 0;
  }
}

export { PrimitiveNil };
