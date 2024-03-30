/**
 * CONTEXT_env
 * Fields    : number of children
 * Children  :
 * - address of the environment (ENVIROMENT_frame)
 */

import { Heap } from "../../heap";
import { auto_cast } from "../auto_cast";
import { ComplexBuiltin } from "../complex/builtin";
import { ComplexString } from "../complex/string";
import { EnvironmentFrame } from "../environment/frame";
import { HeapObject } from "../objects";
import { TAG_CONTEXT_env } from "../tags";
import { UserStruct } from "../user/struct";
import { UserTypeBuiltin } from "../user/type/builtin";
import { UserTypeStruct } from "../user/type/struct";

/**
 * The environment of the ECE. The content is stored inside the heap.
 */
class ContextEnv extends HeapObject {
  public create_global_environment(imports: { name: string; value: any }[], default_imports: { name: string; value: any }[]): void {
    if (this.get_tag() !== TAG_CONTEXT_env) {
      throw new Error("ContextEnv.create_global_environment: Invalid tag");
    }
    this.push_frame();
    // link imports
    const builtin_type = auto_cast(this.heap, UserTypeBuiltin.allocate(this.heap, "builtin")) as ComplexBuiltin;
    for (const imp of imports) {
      const name = auto_cast(this.heap, this.heap.allocate_COMPLEX_string("IMPORT." + imp.name)) as ComplexString;
      const members = imp.value.map((v: any) => {
        return {
          name: auto_cast(this.heap, this.heap.allocate_COMPLEX_string(v.name)) as ComplexString,
          type: builtin_type
        }
      });
      const type = auto_cast(this.heap, UserTypeStruct.allocate(this.heap, name, members)) as UserTypeStruct;
      const import_obj = auto_cast(this.heap, UserStruct.allocate(this.heap, type)) as UserStruct;
      imp.value.forEach((v: any) => {
        const variable_name = this.heap.allocate_COMPLEX_string(v.name);
        const variable = import_obj.get_frame().get_variable_address(variable_name);
        const function_obj = auto_cast(this.heap, this.heap.allocate_COMPLEX_builtin({tag: "builtin", name: v.value})) as ComplexBuiltin;
        variable.set_value(function_obj);
        this.heap.free_object(variable_name);
        function_obj.free();
      });
      const import_name = this.heap.allocate_COMPLEX_string(imp.name);
      this.get_frame().insert_new_variable(import_name);
      const variable = this.get_frame().get_variable_address(import_name);
      variable.set_value(import_obj);
      name.free();
      members.forEach((m: any) => {
        m.name.free();
      });
      type.free();
      import_obj.free();
      this.heap.free_object(import_name);
    }
    builtin_type.free();

    // link default imports
    default_imports.forEach((imp) => {
      const import_name = this.heap.allocate_COMPLEX_string(imp.name);
      this.get_frame().insert_new_variable(import_name);
      const variable = this.get_frame().get_variable_address(import_name);
      const value = auto_cast(this.heap, this.heap.allocate_any({ tag: "builtin", name: imp.value })) as ComplexBuiltin;
      variable.set_value(value);
      this.heap.free_object(import_name);
      value.free();
    });

    this.push_frame();
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
