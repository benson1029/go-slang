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
  public create_global_environment(imports: Array<string>) {
    this.push_frame();
  }

  /**
   * Get the environment frame object.
   *
   * @returns The environment frame object.
   */
  public get_frame(): EnvironmentFrame {
    return new EnvironmentFrame(this.heap, this.get_child(0));
  }

  public pop_frame(): void {
    const env = this.get_frame();
    this.set_child(0, env.pop_frame().address);
  }

  public push_frame(): void {
    const env = this.get_frame();
    this.set_child(0, env.push_frame().address);
  }

  public static allocate(heap: Heap): number {
    const address = heap.allocate_object(TAG_CONTEXT_env, 1, 1);
    return address;
  }
}

export { ContextEnv };
