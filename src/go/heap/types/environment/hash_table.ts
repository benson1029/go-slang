/**
 * ENVIRONMENT_hash_table
 * Fields    :
 * - number of children
 * - number of inserted elements
 * Children  :
 * - address of underlying table (COMPLEX_array)
 *
 * The hash table is on (string, any) pairs.
 * We can represent this with an ENVIRONMENT_frame object for tha pairs.
 *
 * We use an open addressing scheme with Robin Hood linear probing.
 * When load factor exceeds 0.6, we rehash the table with twice the size.
 *
 * Based on https://github.com/TheNumbat/hashtables/blob/main/code/robin_hood_with_deletion.h.
 */

import { Heap } from "../../heap";
import { ComplexArray } from "../complex/array";
import { ComplexString } from "../complex/string";
import { HeapObject } from "../objects";
import { PrimitiveNil } from "../primitive/nil";
import { TAG_ENVIRONMENT_hash_table } from "../tags";
import { EnvironmentEntry } from "./entry";

const LOAD_FACTOR = 0.6;
const INITIAL_CAPACITY = 8;

class EnvironmentHashTable extends HeapObject {
  private increment_table_size(): void {
    if (this.get_tag() !== TAG_ENVIRONMENT_hash_table) {
      throw new Error("EnvironmentHashTable.increment_table_size: Invalid tag");
    }
    this.set_field(1, this.get_table_size() + 1);
    if (this.get_table_size() > this.get_table_capacity()) {
      throw new Error("EnvironmentHashTable.increment_table_size: Invalid size");
    }
  }

  private should_grow(): boolean {
    if (this.get_tag() !== TAG_ENVIRONMENT_hash_table) {
      throw new Error("EnvironmentHashTable.should_grow: Invalid tag");
    }
    return this.get_table_size() >= LOAD_FACTOR * this.get_table_capacity();
  }

  private to_index(hash: number): number {
    if (this.get_tag() !== TAG_ENVIRONMENT_hash_table) {
      throw new Error("EnvironmentHashTable.to_index: Invalid tag");
    }
    return hash & (this.get_table_capacity() - 1);
  }

  private rehash(new_capacity: number): void {
    if (this.get_tag() !== TAG_ENVIRONMENT_hash_table) {
      throw new Error("EnvironmentHashTable.rehash: Invalid tag");
    }

    const old_table = this.get_table_address() as ComplexArray;
    this.heap.mark_intermediate(old_table.address);

    const new_table = new ComplexArray(this.heap, ComplexArray.allocate(this.heap, new_capacity));
    this.set_child(0, new_table.address);

    this.set_field(1, 0);

    for (let i = 0; i < old_table.get_length(); i++) {
      const value = old_table.get_value_address(i) as EnvironmentEntry;
      if (!value.is_nil()) {
        this.insert_internal(value);
      }
    }

    old_table.free();
  }

  /**
   * Find the index of the entry in the table.
   *
   * @param variable_name_address
   * @returns index of the entry in the table, or null if not found.
   */
  private find_internal(variable_name_address: number): number | null {
    if (this.get_tag() !== TAG_ENVIRONMENT_hash_table) {
      throw new Error("EnvironmentHashTable.find_internal: Invalid tag");
    }

    const table = this.get_table_address();
    if (table.is_nil()) {
      return null;
    }

    const variable_name = new ComplexString(this.heap, variable_name_address);
    const str = variable_name.get_string();

    let dist = 0;
    let index = this.to_index(variable_name.get_hash());

    while (true) {
      const current_entry = table.get_value_address(index) as EnvironmentEntry;
      if (current_entry.is_nil()) {
        return null;
      }

      if (current_entry.get_key_address().get_string() === str) {
        return index;
      }

      const desired = this.to_index(current_entry.get_key_address().get_hash());
      const current_dist = this.to_index(index + this.get_table_capacity() - desired);

      if (current_dist < dist) {
        return null;
      }

      dist++;
      index = this.to_index(index + 1);
    }
  }

  /**
   * Insert a new entry to the table.
   * Guaranteed: there is no entry with the same key in the table.
   * Guaranteed: the table has enough capacity.
   * Important: this method will call reference() on the new_entry.
   *
   * @param new_entry
   */
  private insert_internal(new_entry: EnvironmentEntry): void {
    if (this.get_tag() !== TAG_ENVIRONMENT_hash_table) {
      throw new Error("EnvironmentHashTable.insert_internal: Invalid tag");
    }

    new_entry.reference(); // Increase reference count
    this.increment_table_size();
    const table = this.get_table_address();

    let dist = 0;
    let index = this.to_index(new_entry.get_key_address().get_hash());
    while (true) {
      const current_entry = table.get_value_address(index) as EnvironmentEntry;
      if (current_entry.is_nil()) {
        table.set_value_address(index, new_entry);
        break;
      }

      const desired = this.to_index(current_entry.get_key_address().get_hash());
      const current_dist = this.to_index(index + this.get_table_capacity() - desired);

      if (current_dist < dist) {
        const temp = current_entry.reference() as EnvironmentEntry;
        table.set_value_address(index, new_entry);
        new_entry.free();
        new_entry = temp;
        dist = current_dist;
      }

      dist++;
      index = this.to_index(index + 1);
    }
    new_entry.free();
  }

  private contains(variable_name_address: number): boolean {
    if (this.get_tag() !== TAG_ENVIRONMENT_hash_table) {
      throw new Error("EnvironmentHashTable.contains: Invalid tag");
    }
    return this.find_internal(variable_name_address) !== null;
  }

  private get_table_address(): ComplexArray {
    if (this.get_tag() !== TAG_ENVIRONMENT_hash_table) {
      throw new Error("EnvironmentHashTable.get_table_address: Invalid tag");
    }
    return new ComplexArray(this.heap, this.get_child(0));
  }

  private get_table_size(): number {
    if (this.get_tag() !== TAG_ENVIRONMENT_hash_table) {
      throw new Error("EnvironmentHashTable.get_table_size: Invalid tag");
    }
    return this.get_field(1);
  }

  private get_table_capacity(): number {
    if (this.get_tag() !== TAG_ENVIRONMENT_hash_table) {
      throw new Error("EnvironmentHashTable.get_table_capacity: Invalid tag");
    }
    const table = this.get_table_address();
    if (table.is_nil()) {
      return 0;
    }
    return table.get_length();
  }

  /**
   * Important: this method will call reference() on the entry.
   * @param entry_address
   */
  public insert_new_variable(entry_address: number): void {
    if (this.get_tag() !== TAG_ENVIRONMENT_hash_table) {
      throw new Error("EnvironmentHashTable.insert_new_variable: Invalid tag");
    }

    const entry = new EnvironmentEntry(this.heap, entry_address);
    if (this.contains(entry.get_key_address().address)) {
      throw new Error("Variable already exists in current scope.");
    }

    if (this.get_table_address().is_nil()) {
      this.set_child(0, ComplexArray.allocate(this.heap, INITIAL_CAPACITY));
    } else if (this.should_grow()) {
      this.rehash(this.get_table_capacity() * 2);
    }

    this.insert_internal(entry);
  }

  public find_variable(variable_name_address: number): EnvironmentEntry {
    if (this.get_tag() !== TAG_ENVIRONMENT_hash_table) {
      throw new Error("EnvironmentHashTable.find_variable: Invalid tag");
    }
    const index = this.find_internal(variable_name_address);
    if (index == null) {
      return EnvironmentEntry.allocate_nil(this.heap);
    }
    return this.get_table_address().get_value_address(index) as EnvironmentEntry;
  }

  /**
   * Important: this method will call reference() on the entry.
   * @param entry
   */
  public force_insert(entry: EnvironmentEntry): void {
    if (this.get_tag() !== TAG_ENVIRONMENT_hash_table) {
      throw new Error("EnvironmentHashTable.force_insert: Invalid tag");
    }
    const index = this.find_internal(entry.get_key_address().address);
    if (index == null) {
      this.insert_new_variable(entry.address);
    } else {
      this.get_table_address().set_value_address(index, entry);
    }
  }

  public static allocate(heap: Heap): number {
    const address = heap.allocate_object(TAG_ENVIRONMENT_hash_table, 2, 1);
    heap.set_field(address, 1, 0);
    heap.set_child(address, 0, PrimitiveNil.allocate());
    return address;
  }

  public stringify_i(): string {
    let result = "";
    result += this.address.toString() + " (environment hash table): ";
    result += "size: " + this.get_table_size().toString();
    result += ", capacity: " + this.get_table_capacity().toString();
    result += ", table: ";
    result += "[";
    const table = this.get_table_address();
    for (let i = 0; i < table.get_length(); i++) {
      const entry = table.get_value_address(i) as EnvironmentEntry;
      if (!entry.is_nil()) {
        result += entry.stringify();
        result += ", ";
      }
    }
    result += "]";
    return result;
  }

  public to_object(): any {
    let result = [];
    const table = this.get_table_address();
    for (let i = 0; i < table.get_length(); i++) {
      const entry = table.get_value_address(i) as EnvironmentEntry;
      if (!entry.is_nil()) {
        result.push(entry.to_object());
      }
    }
    return result;
  }
}

export { EnvironmentHashTable };
