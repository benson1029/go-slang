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
import { UserVariable } from "../user/variable";
import { EnvironmentEntry } from "./entry";
import { EnvironmentHashTable } from "./hash_table";

const CUR_HASH_TABLE = 1;
const CACHE_HASH_TABLE = 2;

class EnvironmentFrame extends HeapObject {
  private get_parent_frame_address(): EnvironmentFrame {
    if (this.get_tag() !== TAG_ENVIRONMENT_frame) {
      throw new Error("EnvironmentFrame.get_parent_frame_address: Invalid tag");
    }
    return new EnvironmentFrame(this.heap, this.get_child(0));
  }

  private get_lookup_hash_table_address(): EnvironmentHashTable {
    if (this.get_tag() !== TAG_ENVIRONMENT_frame) {
      throw new Error(
        "EnvironmentFrame.get_lookup_hash_table_address: Invalid tag"
      );
    }
    return new EnvironmentHashTable(this.heap, this.get_child(CUR_HASH_TABLE));
  }

  private get_cache_hash_table_address(): EnvironmentHashTable {
    if (this.get_tag() !== TAG_ENVIRONMENT_frame) {
      throw new Error(
        "EnvironmentFrame.get_cache_hash_table_address: Invalid tag"
      );
    }
    return new EnvironmentHashTable(
      this.heap,
      this.get_child(CACHE_HASH_TABLE)
    );
  }

  private lookup_current_scope(key_address: number): EnvironmentEntry {
    if (this.get_tag() !== TAG_ENVIRONMENT_frame) {
      throw new Error("EnvironmentFrame.lookup_current_scope: Invalid tag");
    }
    if (this.get_lookup_hash_table_address().is_nil()) {
      return EnvironmentEntry.allocate_nil(this.heap);
    }
    const table = this.get_lookup_hash_table_address();
    if (!table.is_nil()) {
      const entry = table.find_variable(key_address);
      if (!entry.is_nil()) {
        return entry;
      }
    }
    return EnvironmentEntry.allocate_nil(this.heap);
  }

  private lookup_current_frame(key_address: number): EnvironmentEntry {
    if (this.get_tag() !== TAG_ENVIRONMENT_frame) {
      throw new Error("EnvironmentFrame.lookup_current_frame: Invalid tag");
    }

    // first, check whether current frame has the variable
    const entry = this.lookup_current_scope(key_address);
    if (!entry.is_nil()) {
      return entry;
    }

    // check the cache of parent frames' variables
    if (!this.get_cache_hash_table_address().is_nil()) {
      const entry =
        this.get_cache_hash_table_address().find_variable(key_address);
      if (!entry.is_nil()) {
        return entry;
      }
    }

    // not found
    return EnvironmentEntry.allocate_nil(this.heap);
  }

  /**
   * Important: This method calls reference() for the entry.
   * @param entry
   */
  private insert_to_cache(entry: EnvironmentEntry): void {
    if (this.get_tag() !== TAG_ENVIRONMENT_frame) {
      throw new Error("EnvironmentFrame.insert_to_cache: Invalid tag");
    }
    this.set_cannnot_be_freed(true);
    if (this.get_cache_hash_table_address().is_nil()) {
      this.set_child(
        CACHE_HASH_TABLE,
        EnvironmentHashTable.allocate(this.heap)
      );
    }
    this.get_cache_hash_table_address().force_insert(entry);
    this.set_cannnot_be_freed(false);
  }

  /**
   * Looks up the environment entry for a variable name.
   *
   * @param key address of the variable name (COMPLEX_string)
   * @returns address of the environment entry
   */
  public lookup_entry(key_address: number): EnvironmentEntry {
    if (this.get_tag() !== TAG_ENVIRONMENT_frame) {
      throw new Error("EnvironmentFrame.lookup_entry: Invalid tag");
    }

    {
      // try to find the variable in the current frame
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
    return EnvironmentEntry.allocate_nil(this.heap);
  }

  /**
   * Inserts a new entry to the current frame's lookup hash table.
   * Important: This method calls reference() for the new_entry.
   *
   * @param new_entry
   * @returns
   */
  public insert_entry(new_entry: EnvironmentEntry): EnvironmentEntry {
    if (this.get_tag() !== TAG_ENVIRONMENT_frame) {
      throw new Error("EnvironmentFrame.insert_entry: Invalid tag");
    }

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
   * Important: This method calls reference() for the new entry.
   *
   * @param key_address address of the variable name (COMPLEX_string)
   * @returns address of the environment entry
   */
  public insert_new_variable(key_address: number): EnvironmentEntry {
    if (this.get_tag() !== TAG_ENVIRONMENT_frame) {
      throw new Error("EnvironmentFrame.insert_new_variable: Invalid tag");
    }

    const entry = this.lookup_current_scope(key_address);
    if (!entry.is_nil()) {
      throw new Error("Variable already exists in current scope.");
    }

    this.set_cannnot_be_freed(true);
    const variable_nil = UserVariable.allocate_nil(this.heap);
    const new_entry_address = EnvironmentEntry.allocate(
      this.heap,
      key_address,
      variable_nil
    );
    this.heap.free_object(variable_nil);
    const new_entry = new EnvironmentEntry(this.heap, new_entry_address);
    this.set_cannnot_be_freed(false);

    this.insert_entry(new_entry);
    new_entry.free();
    return new_entry;
  }

  public get_variable_address(key_address: number): UserVariable {
    if (this.get_tag() !== TAG_ENVIRONMENT_frame) {
      throw new Error("EnvironmentFrame.get_variable_address: Invalid tag");
    }
    const entry = this.lookup_entry(key_address);
    if (entry.is_nil()) {
      throw new Error(
        "Variable " +
          auto_cast(this.heap, key_address).stringify() +
          " does not exist in current scope."
      );
    }
    return entry.get_variable_address();
  }

  /**
   * Important: This method calls free() for the current frame (destructive operation).
   * Note: this method can be called even if the current frame is nil.
   *
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
    if (this.get_tag() !== TAG_ENVIRONMENT_frame) {
      throw new Error("EnvironmentFrame.pop_frame: Invalid tag");
    }
    const parent_frame =
      this.get_parent_frame_address().reference() as EnvironmentFrame;
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
    result += "parent: " + this.get_parent_frame_address().stringify();
    result += ", current: " + this.get_lookup_hash_table_address().stringify();
    // result += ", cache: " + this.get_cache_hash_table_address().stringify();
    return result;
  }
}

export { EnvironmentFrame };
