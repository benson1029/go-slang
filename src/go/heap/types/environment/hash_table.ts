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
import { TAG_ENVIRONMENT_hash_table } from "../tags";
import { EnvironmentEntry } from "./entry";

const LOAD_FACTOR = 0.6;
const INITIAL_CAPACITY = 8;

class EnvironmentHashTable extends HeapObject {
  private increment_table_size(): void {
    this.set_field(1, this.get_table_size() + 1);
  }

  private should_grow(): boolean {
    return this.get_table_size() >= LOAD_FACTOR * this.get_table_capacity();
  }

  private fast_mod(hash: number): number {
    return hash & (this.get_table_capacity() - 1);
  }

  private rehash(new_capacity: number): void {
    this.set_cannnot_be_freed(true);

    const old_table = this.get_table_address().reference() as ComplexArray;
    old_table.set_cannnot_be_freed(true);

    const new_table = new ComplexArray(this.heap, ComplexArray.allocate(this.heap, new_capacity));
    new_table.set_cannnot_be_freed(true);

    this.set_field(1, 0);
    this.set_child(0, new_table.address);

    for (let i = 0; i < old_table.get_length(); i++) {
      const value = old_table.get_value_address(i) as EnvironmentEntry;
      if (!value.is_nil()) {
        this.insert_internal(value);
      }
    }

    this.set_cannnot_be_freed(false);
    old_table.set_cannnot_be_freed(false);
    new_table.set_cannnot_be_freed(false);

    old_table.free();
  }

  // Returns nil if the key is not found.
  private find_internal(variable_name_address: number): number | null {
    const table = this.get_table_address();
    if (table.is_nil()) {
      return null;
    }

    const variable_name = new ComplexString(this.heap, variable_name_address);
    const str = variable_name.get_string();

    let dist = 0;
    let index = this.fast_mod(variable_name.get_hash());

    while (true) {
      const current_entry = table.get_value_address(index) as EnvironmentEntry;
      if (current_entry.is_nil()) {
        return null;
      }

      if (current_entry.get_key_address().get_string() === str) {
        return index;
      }

      const desired = this.fast_mod(current_entry.get_key_address().get_hash());
      const current_dist = this.fast_mod(index + this.get_table_capacity() - desired);

      if (current_dist < dist) {
        return null;
      }

      dist++;
      index = this.fast_mod(index + 1);
    }
  }

  // Guarantee: there is no entry with the same key in the table.
  private insert_internal(new_entry: EnvironmentEntry): void {
    this.increment_table_size();
    const table = this.get_table_address();

    let dist = 0;
    let index = this.fast_mod(new_entry.get_key_address().get_hash());
    while (true) {
      const current_entry = table.get_value_address(index) as EnvironmentEntry;
      if (current_entry.is_nil()) {
        table.set_value_address(index, new_entry);
        return;
      }

      const desired = this.fast_mod(current_entry.get_key_address().get_hash());
      const current_dist = this.fast_mod(index + this.get_table_capacity() - desired);

      if (current_dist < dist) {
        const temp = current_entry.reference() as EnvironmentEntry;
        table.set_value_address(index, new_entry);
        new_entry = temp;
        dist = current_dist;
      }

      dist++;
      index = this.fast_mod(index + 1);
    }
  }

  private contains(variable_name_address: number): boolean {
    return this.find_internal(variable_name_address) !== null;
  }

  private get_table_address(): ComplexArray {
    return new ComplexArray(this.heap, this.get_child(0));
  }

  private get_table_size(): number {
    return this.get_field(1);
  }

  private get_table_capacity(): number {
    const table = this.get_table_address();
    if (table.is_nil()) {
      return 0;
    }
    return table.get_length();
  }

  public insert_new_variable(entry_address: number): void {
    const entry = new EnvironmentEntry(this.heap, entry_address);
    if (this.contains(entry.get_key_address().address)) {
      throw new Error("Variable already exists in current scope.");
    }

    const table = this.get_table_address();
    if (table.is_nil()) {
      this.rehash(INITIAL_CAPACITY);
    } else if (this.should_grow()) {
      this.rehash(this.get_table_capacity() * 2);
    }

    this.insert_internal(entry);
  }

  public find_variable(variable_name_address: number): EnvironmentEntry {
    const index = this.find_internal(variable_name_address);
    if (index === null) {
      return new EnvironmentEntry(this.heap, 0);
    }
    return new EnvironmentEntry(this.heap, this.get_table_address().get_value_address(index).address);
  }

  public force_insert(entry: EnvironmentEntry): void {
    const index = this.find_internal(entry.get_key_address().address);
    if (index === null) {
      this.insert_new_variable(entry.address);
    } else {
      this.get_table_address().set_value_address(index, entry);
    }
  }

  public static allocate(heap: Heap): number {
    const address = heap.allocate_object(TAG_ENVIRONMENT_hash_table, 2, 1);
    heap.set_field(address, 1, 0);
    heap.set_child(address, 0, 0);
    return address;
  }

  public stringify_i(): string {
    let result = "";
    result += this.address.toString() + " (environment hash table): ";
    result += "size: " + this.get_table_size().toString();
    result += ", capacity: " + this.get_table_capacity().toString();
    result += ", table: ";
    result += this.get_table_address().stringify();
    return result;
  }
}

export { EnvironmentHashTable };
