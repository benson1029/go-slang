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
import { TAG_CONTROL_literal } from "../tags";

class ControlLiteral extends HeapObject {
  public copy(): number {
    this.increment_reference_count();
    return this.address;
  }

  public get_type_address(): number {
    return this.get_child(0);
  }

  public get_value_address(): number {
    return this.get_child(1);
  }

  public get_type(): string {
    return new ComplexString(this.heap, this.get_type_address()).get_string();
  }

  public get_value(): any {
    const type = this.get_type();
    const value_address = this.get_value_address();
    switch (type) {
      case "bool":
        return new PrimitiveBool(this.heap, value_address).get_value();
      case "int32":
        return new PrimitiveInt32(this.heap, value_address).get_value();
      case "float32":
        return new PrimitiveFloat32(this.heap, value_address).get_value();
      case "string":
        return new ComplexString(this.heap, value_address).get_string();
      default:
        throw new Error("Unknown type");
    }
  }

  public static allocate(heap: Heap, type: string, value: any): number {
    const address = heap.allocate_object(TAG_CONTROL_literal, 1, 2);
    heap.set_cannnot_be_freed(address, true);

    const type_address = ComplexString.allocate(heap, type);
    heap.set_cannnot_be_freed(type_address, true);

    let value_address: number;
    switch (type) {
      case "bool":
        value_address = heap.allocate_PRIMITIVE_bool(value);
        break;
      case "int32":
        value_address = heap.allocate_PRIMITIVE_int32(value);
        break;
      case "float32":
        value_address = heap.allocate_PRIMITIVE_float32(value);
        break;
      case "string":
        value_address = heap.allocate_COMPLEX_string(value);
        break;
      default:
        throw new Error("Unknown type");
    }

    heap.set_child(address, 0, type_address);
    heap.set_child(address, 1, value_address);

    heap.set_cannnot_be_freed(address, false);
    heap.set_cannnot_be_freed(type_address, false);

    return address;
  }
}

export { ControlLiteral };
