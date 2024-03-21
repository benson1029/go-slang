import { Heap } from "../heap";
import {
  TAGSTRING_PRIMITIVE_bool,
  TAGSTRING_PRIMITIVE_float32,
  TAGSTRING_PRIMITIVE_int32,
  TAGSTRING_PRIMITIVE_rune,
} from "./tags";

function default_value(heap: Heap, type: string, value: any) {
  if (value != null) {
    return value;
  }

  switch (type) {
    case TAGSTRING_PRIMITIVE_int32:
      return { tag: "literal", type: type, value: 0 };
    case TAGSTRING_PRIMITIVE_float32:
      return { tag: "literal", type: type, value: 0.0 };
    case TAGSTRING_PRIMITIVE_rune:
      return { tag: "literal", type: type, value: 0 };
    case TAGSTRING_PRIMITIVE_bool:
      return { tag: "literal", type: type, value: false };
    default:
      throw new Error(`Unknown type: ${type}`);
  }
}

export { default_value };
