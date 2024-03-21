import { Heap } from "../heap";
import { PrimitiveBool } from "./primitive/bool";
import { PrimitiveFloat32 } from "./primitive/float32";
import { PrimitiveInt32 } from "./primitive/int32";
import { PrimitiveRune } from "./primitive/rune";

function default_value(heap: Heap, type: string, value: any) {
  if (value != null) {
    return value;
  }

  switch (type) {
    case "int32":
      return PrimitiveInt32.allocate(heap, 0);
    case "float32":
      return PrimitiveFloat32.allocate(heap, 0);
    case "rune":
      return PrimitiveRune.allocate(heap, 0);
    case "bool":
      return PrimitiveBool.allocate(heap, false);
    default:
      throw new Error(`Unknown type: ${type}`);
  }
}

export { default_value };
