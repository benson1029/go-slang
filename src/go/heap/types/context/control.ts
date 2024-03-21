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

/**
 * The control stack of the ECE. The content is stored inside the heap.
 */
class ContextControl extends HeapObject {
  private get_control(): ComplexLinkedList {
    return new ComplexLinkedList(this.heap, this.get_child(0));
  }

  /**
   * Pops the top element of the control stack.
   *
   * @returns The top element of the control stack.
   */
  public pop(): number {
    if (this.length() === 0) {
      return undefined;
    }
    const control_stack = this.get_control();
    const cmd = control_stack.get_value_address().reference().address;
    this.set_child(0, control_stack.remove_current_node().address);
    this.set_field(1, this.length() - 1);
    return cmd;
  }

  /**
   * Pushes a new element onto the control stack.
   *
   * @param cmd The element to push onto the control stack.
   */
  public push(cmd: number): void {
    let control_stack = this.get_control();
    control_stack = control_stack.insert_before(cmd);
    this.set_child(0, control_stack.address);
    this.set_field(1, this.length() + 1);
  }

  /**
   * Peeks at the top element of the control stack.
   *
   * @returns The top element of the control stack.
   */
  public peek(): number {
    if (this.length() === 0) {
      return undefined;
    }
    return this.get_control().get_value_address().address;
  }

  /**
   * Returns the length of the control stack.
   *
   * @returns The length of the control stack.
   */
  public length(): number {
    return this.get_field(1);
  }

  public static allocate(heap: Heap): number {
    const address = heap.allocate_object(TAG_CONTEXT_control, 2, 1);
    heap.set_field(address, 1, 0);
    return address;
  }

  public stringify_i(): string {
    return this.address.toString() + " (control): " + this.get_control().stringify();
  }
}

export { ContextControl };
