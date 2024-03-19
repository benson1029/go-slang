/**
 * ENVIRONMENT_frame
 * Fields    : number of children
 * Children  :
 * - parent frame (ENVIRONMENT_frame)
 * - linked list of entries (ENVIRONMENT_entry)
 * - hash table of entries for fast lookup (ENVIRONMENT_hash_table)
 * - hash table of all entries, including parent frames, for caching (ENVIRONMENT_hash_table)
 */

import { Heap } from "../../heap";
import { auto_cast } from "../auto_cast";
import { ComplexLinkedList } from "../complex/linked_list";
import { HeapObject } from "../objects";
import { PrimitiveNil } from "../primitive/nil";
import { TAG_ENVIRONMENT_frame } from "../tags";
import { EnvironmentEntry } from "./entry";
import { EnvironmentHashTable } from "./hash_table";

class EnvironmentFrame extends HeapObject {
  private get_parent_frame_address(): EnvironmentFrame {
    return new EnvironmentFrame(this.heap, this.get_child(0));
  }

  private get_linked_list_address(): ComplexLinkedList {
    return new ComplexLinkedList(this.heap, this.get_child(1));
  }

  private get_lookup_hash_table_address(): EnvironmentHashTable {
    return new EnvironmentHashTable(this.heap, this.get_child(2));
  }

  private get_cache_hash_table_address(): EnvironmentHashTable {
    return new EnvironmentHashTable(this.heap, this.get_child(3));
  }

  private lookup_current_frame(key_address: number): EnvironmentEntry {
    { // first, check whether current frame has the variable
      const table = this.get_lookup_hash_table_address();
      if (!table.is_nil()) {
        const entry = table.find_variable(key_address);
        if (!entry.is_nil()) {
          return entry;
        }
      }
    }

    // check the cache of parent frames' variables
    if (!this.get_cache_hash_table_address().is_nil()) {
      const entry = this.get_cache_hash_table_address().find_variable(key_address);
      if (!entry.is_nil()) {
        return entry;
      }
    }

    // not found
    return new EnvironmentEntry(this.heap, PrimitiveNil.allocate());
  }

  private insert_to_cache(entry: EnvironmentEntry): void {
    if (this.get_cache_hash_table_address().is_nil()) {
      this.set_child(3, EnvironmentHashTable.allocate(this.heap));
    }
    this.get_cache_hash_table_address().force_insert(entry);
  }

  /**
   * @param key address of the variable name (COMPLEX_string)
   * @returns address of the environment entry
   */
  private lookup(key_address: number): EnvironmentEntry {
    { // try to find the variable in the current frame
      const entry = this.lookup_current_frame(key_address);
      if (!entry.is_nil()) {
        return entry;
      }
    }
    console.log("lookup in parent frames");
    let frame = this.get_parent_frame_address();
    console.log(frame.is_nil())
    while (!frame.is_nil()) {
      const entry = frame.lookup_current_frame(key_address);
      console.log(entry.is_nil())
      if (!entry.is_nil()) {
        // Cache it, so subsequent lookups are faster
        this.insert_to_cache(entry);
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
  public insert_new_variable(key_address: number): EnvironmentEntry {
    const entry = this.lookup_current_frame(key_address);
    if (!entry.is_nil()) {
      throw new Error("Variable already exists in current scope.");
    }

    this.set_cannnot_be_freed(true);
    const new_entry = EnvironmentEntry.allocate(this.heap, key_address, PrimitiveNil.allocate());
    this.set_child(1, this.get_linked_list_address().insert_before(new_entry).address);

    // Insert to the current scope lookup hash table
    if (this.get_lookup_hash_table_address().is_nil()) {
      this.set_child(2, EnvironmentHashTable.allocate(this.heap));
    }
    this.get_lookup_hash_table_address().insert_new_variable(new_entry);

    this.set_cannnot_be_freed(false);
    return new EnvironmentEntry(this.heap, new_entry);
  }

  /**
   * Sets the value of a variable. This method does not create a new variable.
   * @param key_address address of the variable name (COMPLEX_string)
   * @param value_address address of the value (any)
   */
  public set_variable_value_address(key_address: number, value_address: number): void {
    const entry = this.lookup(key_address);
    if (entry.is_nil()) {
      throw new Error("Variable does not exist in current scope.");
    }
    entry.set_value_address(value_address);
  }

  /**
   * Gets the value of a variable. This method does not create a new variable.
   * @param key_address address of the variable name (COMPLEX_string)
   * @returns address of the value (any)
   */
  public get_variable_value_address(key_address: number): HeapObject {
    const entry = this.lookup(key_address);
    if (entry.is_nil()) {
      throw new Error("Variable does not exist in current scope.");
    }
    return entry.get_value_address();
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
    const parent_frame = auto_cast(heap, parent_frame_address).reference();
    heap.set_cannnot_be_freed(parent_frame.address, true);

    const address = heap.allocate_object(TAG_ENVIRONMENT_frame, 1, 4);
    heap.set_child(address, 0, parent_frame.address);
    heap.set_child(address, 1, PrimitiveNil.allocate());
    heap.set_child(address, 2, PrimitiveNil.allocate());
    heap.set_child(address, 3, PrimitiveNil.allocate());
    heap.set_cannnot_be_freed(parent_frame.address, false);

    return address;
  }
}

export { EnvironmentFrame };
