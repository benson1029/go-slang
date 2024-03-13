/**
 * PRIMITIVE_nil
 * Fields    : None
 * Children  : None
 *
 * @returns address of the object
 */

import { HeapObject } from "../objects";

class PrimitiveNil extends HeapObject {
  public get_value(): null {
    return null;
  }
}

export { PrimitiveNil };
