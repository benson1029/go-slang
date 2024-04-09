/**
 * PRIMITIVE_nil
 * Fields    : None
 * Children  : None
 */

import { Primitive } from ".";
import { Heap } from "../../heap";

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

  public static allocate_default(heap: Heap): PrimitiveNil {
    return new PrimitiveNil(heap, PrimitiveNil.allocate());
  }

  public stringify_i(): string {
    return this.address.toString() + " (nil)";
  }

  public to_object(): any {
    return "nil";
  }
}

export { PrimitiveNil };
