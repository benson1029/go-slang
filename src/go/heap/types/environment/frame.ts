/**
 * ENVIRONMENT_frame
 * Fields    : number of children
 * Children  :
 * - parent frame (ENVIRONMENT_frame)
 * - hash table of entries for fast lookup_entry (ENVIRONMENT_hash_table)
 * - hash table of all entries, including parent frames, for caching (ENVIRONMENT_hash_table)
 */

import { Heap } from "../../heap";
import { auto_cast } from "../auto_cast";
import { HeapObject } from "../objects";
import { PrimitiveNil } from "../primitive/nil";
import { TAG_ENVIRONMENT_frame } from "../tags";
import { EnvironmentEntry } from "./entry";
import { EnvironmentHashTable } from "./hash_table";

const CUR_HASH_TABLE = 1;
const CACHE_HASH_TABLE = 2;

class EnvironmentFrame extends HeapObject {
  private get_parent_frame_address(): EnvironmentFrame {
    return new EnvironmentFrame(this.heap, this.get_child(0));
  }

  private get_lookup_hash_table_address(): EnvironmentHashTable {
    return new EnvironmentHashTable(this.heap, this.get_child(CUR_HASH_TABLE));
  }

  private get_cache_hash_table_address(): EnvironmentHashTable {
    return new EnvironmentHashTable(this.heap, this.get_child(CACHE_HASH_TABLE));
  }

  private lookup_current_scope(key_address: number): EnvironmentEntry {
    const table = this.get_lookup_hash_table_address();
    if (!table.is_nil()) {
      const entry = table.find_variable(key_address);
      if (!entry.is_nil()) {
        return entry;
      }
    }
    return new EnvironmentEntry(this.heap, PrimitiveNil.allocate());
  }

  private lookup_current_frame(key_address: number): EnvironmentEntry {
    // first, check whether current frame has the variable
    const entry = this.lookup_current_scope(key_address);
    if (!entry.is_nil()) {
      return entry;
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
      this.set_child(CACHE_HASH_TABLE, EnvironmentHashTable.allocate(this.heap));
    }
    this.get_cache_hash_table_address().force_insert(entry);
  }

  /**
   * @param key address of the variable name (COMPLEX_string)
   * @returns address of the environment entry
   */
  public lookup_entry(key_address: number): EnvironmentEntry {
    { // try to find the variable in the current frame
      const entry = this.lookup_current_frame(key_address);
      if (!entry.is_nil()) {
        return entry;
      }
    }

    let frame = this.get_parent_frame_address();
    while (!frame.is_nil()) {
      const entry = frame.lookup_current_frame(key_address);
      if (!entry.is_nil()) {
        // Cache it, so subsequent lookups are faster
        this.insert_to_cache(entry);
        return entry;
      }
      frame = frame.get_parent_frame_address();
    }
    return new EnvironmentEntry(this.heap, PrimitiveNil.allocate());
  }

  public insert_entry(new_entry: EnvironmentEntry): EnvironmentEntry {
    // Insert to the current scope lookup_entry hash table
    this.set_cannnot_be_freed(true);

    if (this.get_lookup_hash_table_address().is_nil()) {
      this.set_child(CUR_HASH_TABLE, EnvironmentHashTable.allocate(this.heap));
    }
    this.get_lookup_hash_table_address().insert_new_variable(new_entry.address);

    this.set_cannnot_be_freed(false);
    return new_entry;
  }

  /**
   * Modifies the environment frame by adding a new entry (variable name).
   *
   * @param key_address address of the variable name (COMPLEX_string)
   * @returns address of the environment entry
   */
  public insert_new_variable(key_address: number): EnvironmentEntry {
    const entry = this.lookup_current_scope(key_address);
    if (!entry.is_nil()) {
      throw new Error("Variable already exists in current scope.");
    }

    this.set_cannnot_be_freed(true);
    const new_entry_address = EnvironmentEntry.allocate(this.heap, key_address, PrimitiveNil.allocate());
    const new_entry = new EnvironmentEntry(this.heap, new_entry_address);
    this.set_cannnot_be_freed(false);

    this.insert_entry(new_entry);
    return new_entry;
  }

  /**
   * Sets the value of a variable. This method does not create a new variable.
   * @param key_address address of the variable name (COMPLEX_string)
   * @param value_address address of the value (any)
   */
  public set_variable_value_address(key_address: number, value_address: number): void {
    const entry = this.lookup_entry(key_address);
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
    const entry = this.lookup_entry(key_address);
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
    const parent_frame = this.get_parent_frame_address().reference() as EnvironmentFrame;
    this.free();
    return parent_frame;
  }

  public static allocate(heap: Heap, parent_frame_address: number) {
    const parent_frame = auto_cast(heap, parent_frame_address).reference();
    heap.set_cannnot_be_freed(parent_frame.address, true);

    const address = heap.allocate_object(TAG_ENVIRONMENT_frame, 1, 3);
    heap.set_child(address, 0, parent_frame.address);
    heap.set_child(address, CUR_HASH_TABLE, PrimitiveNil.allocate());
    heap.set_child(address, CACHE_HASH_TABLE, PrimitiveNil.allocate());
    heap.set_cannnot_be_freed(parent_frame.address, false);

    return address;
  }

  public stringify_i(): string {
    let result = "";
    result += this.address.toString() + " (environment frame): ";
    result += "parent: " + this.get_parent_frame_address().toString();
    result += ", current: " + this.get_lookup_hash_table_address().toString();
    result += ", cache: " + this.get_cache_hash_table_address().toString();
    return result;
  }
}

export { EnvironmentFrame };
