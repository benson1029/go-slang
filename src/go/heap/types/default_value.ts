import { Heap } from "../heap";
import { PrimitiveBool } from "./primitive/bool";
import { PrimitiveFloat32 } from "./primitive/float32";
import { PrimitiveInt32 } from "./primitive/int32";
import { PrimitiveRune } from "./primitive/rune";

function default_value(heap: Heap, type: string, value: any) {
  switch (type) {
    case "int32":
      return PrimitiveInt32.allocate(
        heap,
        value === null || value === undefined ? 0 : value
      );
    case "float32":
      return PrimitiveFloat32.allocate(
        heap,
        value === null || value === undefined ? 0 : value
      );
    case "rune":
      return PrimitiveRune.allocate(
        heap,
        value === null || value === undefined ? 0 : value
      );
    case "bool":
      return PrimitiveBool.allocate(
        heap,
        value === null || value === undefined ? false : value
      );
    default:
      return value;
  }
}

export { default_value };
