/**
 * CONTEXT_control
 * Fields    : number of children, length of control stack
 * Children  :
 * - address of linked list (COMPLEX_linked_list)
 */

import { Heap } from "../../heap";
import { HeapObject } from "../objects";
import { ComplexLinkedList } from "../complex/linked_list";
import { TAG_CONTEXT_control } from "../tags";
import { PrimitiveNil } from "../primitive/nil";

/**
 * The control stack of the ECE. The content is stored inside the heap.
 */
class ContextControl extends HeapObject {
  private get_control(): ComplexLinkedList {
    if (this.get_tag() !== TAG_CONTEXT_control) {
      throw new Error("ContextControl.get_control: Invalid tag");
    }
    return new ComplexLinkedList(this.heap, this.get_child(0));
  }

  /**
   * Pops the top element of the control stack.
   * Important: This method returns a reference() to the value.
   * Important: This method calls free() on the top element of the control stack.
   *
   * @returns The top element of the control stack.
   */
  public pop(): number {
    if (this.get_tag() !== TAG_CONTEXT_control) {
      throw new Error("ContextControl.pop: Invalid tag");
    }
    if (this.empty()) {
      return PrimitiveNil.allocate();
    }
    const control_stack = this.get_control();
    const cmd = control_stack.get_value_address().reference().address;
    this.heap.mark_intermediate(cmd);
    this.set_child(0, control_stack.pop_front().address);
    return cmd;
  }

  /**
   * Pushes a new element onto the control stack.
   * Important: This method calls reference() on the value.
   *
   * @param cmd The element to push onto the control stack.
   */
  public push(cmd: number): void {
    if (this.get_tag() !== TAG_CONTEXT_control) {
      throw new Error("ContextControl.push: Invalid tag");
    }
    const control_stack = this.get_control();
    this.set_child(0, control_stack.insert_before(cmd).address);
  }

  /**
   * Peeks at the top element of the control stack.
   * Important: This method does not return a reference to the value.
   *
   * @returns The top element of the control stack.
   */
  public peek(): number {
    if (this.get_tag() !== TAG_CONTEXT_control) {
      throw new Error("ContextControl.peek: Invalid tag");
    }
    if (this.empty()) {
      return PrimitiveNil.allocate();
    }
    return this.get_control().get_value_address().address;
  }

  public empty(): boolean {
    if (this.get_tag() !== TAG_CONTEXT_control) {
      throw new Error("ContextControl.length: Invalid tag");
    }
    return this.get_control().is_nil();
  }

  public clear(): void {
    if (this.get_tag() !== TAG_CONTEXT_control) {
      throw new Error("ContextControl.clear: Invalid tag");
    }
    this.get_control().free();
    this.set_child(0, PrimitiveNil.allocate());
  }

  public static allocate(heap: Heap): number {
    const address = heap.allocate_object(TAG_CONTEXT_control, 1, 1);
    return address;
  }

  public stringify_i(): string {
    return (
      this.address.toString() + " (control): " + this.get_control().stringify()
    );
  }

  public to_object(): any {
    return this.get_control().to_object();
  }
}

export { ContextControl };
