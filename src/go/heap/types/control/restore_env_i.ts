/**
 * CONTROL_restore_env_i
 * Fields    : number of children
 * Children  :
 * - 4 bytes address of the frame to restore (ENVIRONMENT_frame)
 */

import { Heap } from "../../heap";
import { EnvironmentFrame } from "../environment/frame";
import { HeapObject } from "../objects";
import { TAG_CONTROL_restore_env_i } from "../tags";

class ControlRestoreEnvI extends HeapObject {
  public get_frame_address(): EnvironmentFrame {
    return new EnvironmentFrame(this.heap, this.get_child(0));
  }

  public static allocate(heap: Heap, frame: EnvironmentFrame): number {
    const address = heap.allocate_object(TAG_CONTROL_restore_env_i, 1, 1);
    heap.set_child(address, 0, frame.reference().address);
    return address;
  }

  public stringify_i(): string {
    return this.address.toString() + " (restore_env_i): " + this.get_frame_address().stringify();
  }

  public to_object(): any {
    return "RESTORE_ENV_I";
  }
}

export { ControlRestoreEnvI };
