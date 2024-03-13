/**
 * CONTROL_literal
 * Fields    : number of children
 * Children  :
 * - 4 bytes address of the type (COMPLEX_string)
 * - 4 bytes address of the value
*/

import { Heap } from "../../heap";
import { ComplexString } from "../complex/string";
import { HeapObject } from "../objects";
import { PrimitiveBool } from "../primitive/bool";
import { PrimitiveFloat32 } from "../primitive/float32";
import { PrimitiveInt32 } from "../primitive/int32";

import {
  TAGSTRING_COMPLEX_string,
  TAGSTRING_PRIMITIVE_bool,
  TAGSTRING_PRIMITIVE_float32,
  TAGSTRING_PRIMITIVE_int32
} from "../tags";

abstract class ControlLiteral extends HeapObject {
  public static allocate(heap: Heap, type: string, value: any): number {
    switch (type) {
      case TAGSTRING_PRIMITIVE_bool:
        return PrimitiveBool.allocate(heap, value);
      case TAGSTRING_PRIMITIVE_int32:
        return PrimitiveInt32.allocate(heap, value);
      case TAGSTRING_PRIMITIVE_float32:
        return PrimitiveFloat32.allocate(heap, value);
      case TAGSTRING_COMPLEX_string:
        return ComplexString.allocate(heap, value);
      default:
        throw new Error("Unknown type");
    }
  }
}

export { ControlLiteral };
