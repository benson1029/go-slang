/**
 * PRIMITIVE_nil
 * Fields    : None
 * Children  : None
 *
 * @returns address of the object
 */

import { Primitive } from ".";

class PrimitiveNil extends Primitive {
  public get_type(): string {
    return "nil";
  }

  public get_value(): null {
    return null;
  }
}

export { PrimitiveNil };
