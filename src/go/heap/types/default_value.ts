import { Heap } from "../heap";

function default_value(heap: Heap, type: any, value: any) {
  if (value != null) {
    return value;
  }

  switch (type.tag) {
    case "int32-type":
      return { tag: "literal", type: "int32", value: 0 };
    case "float32-type":
      return { tag: "literal", type: "float32", value: 0.0 };
    case "bool-type":
      return { tag: "literal", type: "bool", value: false };
    case "string-type":
      return { tag: "literal", type: "string", value: "" };
    case "array-type":
    case "function-type":
    case "channel-type":
    case "slice-type":
    case "struct-decl-type":
      return { tag: "make", type: type, args: [] };
    default:
      throw new Error(`Unknown type: ${type.tag}`);
  }
}

export { default_value };
