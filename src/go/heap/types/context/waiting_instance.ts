/**
 * CONTEXT_waiting_instance
 * Fields    : number of children
 * Children  :
 * - address to a waker
 * - address to a value
 * - address to a body (for select case)
 */

import { Heap } from "../../heap";
import { auto_cast } from "../auto_cast";
import { HeapObject } from "../objects";
import { PrimitiveNil } from "../primitive/nil";
import { TAG_CONTEXT_waiting_instance } from "../tags";
import { ContextWaker } from "./waker";

class ContextWaitingInstance extends HeapObject {
  public get_waker(): ContextWaker {
    if (this.get_tag() !== TAG_CONTEXT_waiting_instance) {
      throw new Error("ContextWaitingInstance.get_waker: invalid object tag");
    }
    return new ContextWaker(this.heap, this.get_child(0));
  }

  public get_value(): HeapObject {
    if (this.get_tag() !== TAG_CONTEXT_waiting_instance) {
      throw new Error("ContextWaitingInstance.get_waker: invalid object tag");
    }
    return auto_cast(this.heap, this.get_child(1));
  }

  public set_value(value: HeapObject): void {
    if (this.get_tag() !== TAG_CONTEXT_waiting_instance) {
      throw new Error("ContextWaitingInstance.get_waker: invalid object tag");
    }
    const old_value = this.get_value();
    this.set_child(1, value.reference().address);
    old_value.free();
  }

  public get_body(): HeapObject {
    if (this.get_tag() !== TAG_CONTEXT_waiting_instance) {
      throw new Error("ContextWaitingInstance.get_waker: invalid object tag");
    }
    return auto_cast(this.heap, this.get_child(2));
  }

  public set_body(body: HeapObject): void {
    if (this.get_tag() !== TAG_CONTEXT_waiting_instance) {
      throw new Error("ContextWaitingInstance.get_waker: invalid object tag");
    }
    const old_body = this.get_body();
    this.set_child(2, body.reference().address);
    old_body.free();
  }

  public static allocate(heap: Heap, waker: ContextWaker) {
    const address = heap.allocate_object(TAG_CONTEXT_waiting_instance, 1, 3);
    heap.set_child(address, 0, waker.reference().address);
    heap.set_child(address, 1, PrimitiveNil.allocate());
    heap.set_child(address, 2, PrimitiveNil.allocate());
    return address;
  }

  public stringify_i(): string {
    let result = "";

    return result;
  }
}

export { ContextWaitingInstance };
