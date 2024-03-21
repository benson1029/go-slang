/**
 * CONTEXT_stash
 * Fields    : number of children
 * Children  :
 * - address of the stash (COMPLEX_linked_list)
 */

import { Heap } from "../../heap";
import { ComplexLinkedList } from "../complex/linked_list";
import { HeapObject } from "../objects";
import { TAG_CONTEXT_stash } from "../tags";

/**
 * The stash of the ECE. The content is stored inside the heap. The stash only
 * contains addresses to the heap.
 */
class ContextStash extends HeapObject {
  private get_stash(): ComplexLinkedList {
    return new ComplexLinkedList(this.heap, this.get_child(0));
  }

  /**
   * Pushes a new value onto the stash.
   *
   * @param value The address to push onto the stash.
   */
  public push(value: number): void {
    this.set_child(0, this.get_stash().insert_before(value).address);
  }

  /**
   * Pops the top element of the stash.
   *
   * @returns The top element of the stash.
   */
  public pop(): number {
    if (this.get_stash().is_nil()) {
      return undefined;
    }
    const stash = this.get_stash();
    const value = stash.get_value_address().address;
    this.set_child(0, stash.remove_current_node().address);
    return value;
  }

  public static allocate(heap: Heap): number {
    const address = heap.allocate_object(TAG_CONTEXT_stash, 1, 1);
    return address;
  }

  public stringify_i(): string {
    return this.address.toString() + " (stash): " + this.get_stash().stringify();
  }
}

export { ContextStash };
