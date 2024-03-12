import { Heap } from "../heap"

abstract class HeapObject {
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

  public get_reference_count(): number {
    return this.heap.get_reference_count(this.address);
  }

  public increment_reference_count(): void {
    this.heap.increment_reference_count(this.address);
  }

  public decrement_reference_count(): void {
    this.heap.decrement_reference_count(this.address);
  }

  public set_cannnot_be_freed(value: boolean): void {
    this.heap.set_cannnot_be_freed(this.address, value);
  }

  public free(): void {
    this.heap.free_object(this.address);
  }

  public abstract copy(): number;
};

export { HeapObject };
