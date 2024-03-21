import { Heap } from "../heap"
import { auto_cast } from "./auto_cast";
import { TAG_PRIMITIVE_nil, TAG_PRIMITIVE_undefined } from "./tags";

class HeapObject {
  public heap: Heap;
  public address: number;

  constructor(heap: Heap, address: number) {
    this.heap = heap;
    this.address = address;
  }

  public get_tag(): number {
    return this.heap.get_tag(this.address);
  }

  public get_number_of_fields(): number {
    return this.heap.get_number_of_fields(this.address);
  }

  public get_field(index: number): number {
    return this.heap.get_field(this.address, index);
  }

  public set_field(index: number, value: number): void {
    this.heap.set_field(this.address, index, value);
  }

  public get_number_of_children(): number {
    return this.heap.get_number_of_children(this.address);
  }

  public get_child(index: number): number {
    return this.heap.get_child(this.address, index);
  }

  public set_child(index: number, value: number): void {
    this.heap.set_child(this.address, index, value);
  }

  public set_cannnot_be_freed(value: boolean): void {
    this.heap.set_cannnot_be_freed(this.address, value);
  }

  public is_nil(): boolean {
    return this.get_tag() === TAG_PRIMITIVE_nil;
  }

  public is_undefined(): boolean {
    return this.get_tag() === TAG_PRIMITIVE_undefined;
  }

  public free(): void {
    this.heap.free_object(this.address);
  }

  public reference(): HeapObject {
    this.heap.increment_reference_count(this.address);
    return this;
  }

  public copy(): HeapObject {
    const copy_address = this.heap.copy_object(this.address);
    return auto_cast(this.heap, copy_address);
  }

  public stringify(): string {
    return auto_cast(this.heap, this.address).stringify_i();
  }

  public stringify_i(): string {
    return "Not implemented";
  }
}

export { HeapObject };
