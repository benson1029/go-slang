/**
 * ENVIRONMENT_frame
 * Fields    : number of children
 * Children  :
 * - parent frame (ENVIRONMENT_frame)
 * - linked list of entries (ENVIRONMENT_entry)
 */

import { Heap } from "../../heap";
import { auto_cast } from "../auto_cast";
import { ComplexLinkedList } from "../complex/linked_list";
import { ComplexString } from "../complex/string";
import { HeapObject } from "../objects";
import { PrimitiveNil } from "../primitive/nil";
import { TAG_ENVIRONMENT_frame } from "../tags";
import { EnvironmentEntry } from "./entry";

class EnvironmentFrame extends HeapObject {
  public get_parent_frame_address(): EnvironmentFrame {
    return new EnvironmentFrame(this.heap, this.get_child(0));
  }

  public get_linked_list_address(): ComplexLinkedList {
    return new ComplexLinkedList(this.heap, this.get_child(1));
  }

  public lookup_current_frame(key_address: number): EnvironmentEntry {
    let entry = this.get_linked_list_address();
    const str = new ComplexString(this.heap, key_address).get_string();
    while (!entry.is_nil()) {
      const value = entry.get_value_address() as EnvironmentEntry;
      if (value.get_key().get_string() === str) {
        return value;
      }
      entry = entry.get_next_address();
    }
    return new EnvironmentEntry(this.heap, PrimitiveNil.allocate());
  }

  /**
   * @param key address of the variable name (COMPLEX_string)
   * @returns address of the environment entry
   */
  public lookup(key_address: number): EnvironmentEntry {
    let frame = new EnvironmentFrame(this.heap, this.address);
    while (!frame.is_nil()) {
      const entry = frame.lookup_current_frame(key_address);
      if (!entry.is_nil()) {
        return entry;
      }
      frame = frame.get_parent_frame_address();
    }
    return new EnvironmentEntry(this.heap, PrimitiveNil.allocate());
  }

  /**
   * Modifies the environment frame by adding a new entry (variable name).
   * 
   * @param key_address address of the variable name (COMPLEX_string)
   * @returns address of the environment entry
   */
  public insert(key_address: number): EnvironmentEntry {
    const entry = this.lookup_current_frame(key_address);
    if (!entry.is_nil()) {
      throw new Error("Variable already exists in current scope.");
    }

    this.set_cannnot_be_freed(true);

    const new_entry = EnvironmentEntry.allocate(this.heap, key_address, PrimitiveNil.allocate());
    this.set_child(1, this.get_linked_list_address().insert_before(new_entry).address);
    this.set_cannnot_be_freed(false);

    return new EnvironmentEntry(this.heap, new_entry);
  }

  /**
   * Important: This method calls free() for the current frame (destructive operation).
   * @returns a new environment frame with the current frame as the parent frame
   */
  public push_frame(): EnvironmentFrame {
    const new_frame = EnvironmentFrame.allocate(this.heap, this.address);
    this.free();
    return new EnvironmentFrame(this.heap, new_frame);
  }

  /**
   * Important: This method calls free() for the current frame (destructive operation).
   * @returns a new environment frame with the parent frame as the current frame
   */
  public pop_frame(): EnvironmentFrame {
    const parent_frame = this.get_parent_frame_address();
    this.free();
    return parent_frame;
  }

  public static allocate(heap: Heap, parent_frame_address: number) {
    const parent_frame = auto_cast(heap, parent_frame_address);
    heap.set_cannnot_be_freed(parent_frame.address, true);

    const address = heap.allocate_object(TAG_ENVIRONMENT_frame, 1, 2);
    heap.set_child(address, 0, parent_frame.address);
    heap.set_child(address, 1, PrimitiveNil.allocate());
    heap.set_cannnot_be_freed(parent_frame.address, false);

    return address;
  }
}

export { EnvironmentFrame };
