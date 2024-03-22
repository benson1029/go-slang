/**
 * CONTEXT_env
 * Fields    : number of children
 * Children  :
 * - address of the environment (ENVIROMENT_frame)
 */

import { Heap } from "../../heap";
import { EnvironmentFrame } from "../environment/frame";
import { HeapObject } from "../objects";
import { TAG_CONTEXT_env } from "../tags";

/**
 * The environment of the ECE. The content is stored inside the heap.
 */
class ContextEnv extends HeapObject {
  public create_global_environment(imports: { name: string; value: any }[]): void {
    if (this.get_tag() !== TAG_CONTEXT_env) {
      throw new Error("ContextEnv.create_global_environment: Invalid tag");
    }
    this.push_frame();
    for (const imp of imports) {
      const name = this.heap.allocate_COMPLEX_string(imp.name);
      const value = this.heap.allocate_any(imp.value);
      this.get_frame().insert_new_variable(name);
      this.get_frame().set_variable_value_address(name, value);
      this.heap.free_object(name);
      this.heap.free_object(value);
    }
  }

  /**
   * Get the environment frame object.
   * Important: This method does not return a reference to the environment frame.
   *
   * @returns The environment frame object.
   */
  public get_frame(): EnvironmentFrame {
    if (this.get_tag() !== TAG_CONTEXT_env) {
      throw new Error("ContextEnv.get_frame: Invalid tag");
    }
    return new EnvironmentFrame(this.heap, this.get_child(0));
  }

  /**
   * Set the environment frame object.
   * Important: This method will call reference() on the env and free() the old env.
   */
  public set_frame(env: EnvironmentFrame): void {
    if (this.get_tag() !== TAG_CONTEXT_env) {
      throw new Error("ContextEnv.set_frame: Invalid tag");
    }
    const current_env = this.get_frame();
    this.set_child(0, env.reference().address);
    current_env.free();
  }

  public pop_frame(): void {
    if (this.get_tag() !== TAG_CONTEXT_env) {
      throw new Error("ContextEnv.pop_frame: Invalid tag");
    }
    const env = this.get_frame();
    this.set_child(0, env.pop_frame().address);
  }

  public push_frame(): void {
    if (this.get_tag() !== TAG_CONTEXT_env) {
      throw new Error("ContextEnv.push_frame: Invalid tag");
    }
    const env = this.get_frame();
    this.set_child(0, env.push_frame().address);
  }

  public static allocate(heap: Heap): number {
    const address = heap.allocate_object(TAG_CONTEXT_env, 1, 1);
    return address;
  }

  public stringify_i(): string {
    return this.address.toString() + " (env): " + this.get_frame().stringify();
  }
}

export { ContextEnv };
