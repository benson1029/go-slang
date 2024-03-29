/**
 * USER struct
 * Fields    :
 * - number of children
 * Children  :
 * - 4 bytes environment frame address (ENVIRONMENT_frame)
 */

import { Heap } from "../../heap";
import { EnvironmentFrame } from "../environment/frame";
import { HeapObject } from "../objects";
import { PrimitiveNil } from "../primitive/nil";
import { TAG_USER_struct } from "../tags";
import { UserTypeStruct } from "./type/struct";
import { UserVariable } from "./variable";

class UserStruct extends HeapObject {
  public get_frame(): EnvironmentFrame {
    if (this.get_tag() !== TAG_USER_struct) {
      throw new Error("UserStruct.get_frame: Invalid tag");
    }
    return new EnvironmentFrame(this.heap, this.get_child(0));
  }

  public static allocate(heap: Heap, type: UserTypeStruct): number {
    const address = heap.allocate_object(TAG_USER_struct, 1, 1);
    const env_address = EnvironmentFrame.allocate(
      heap,
      PrimitiveNil.allocate()
    );
    heap.set_child(address, 0, env_address);
    const env = new EnvironmentFrame(heap, env_address);

    for (let i = 0; i < type.get_number_of_members(); i++) {
      const member_type = type.get_member_type(i);
      const member_name = type.get_member_name(i);
      const entry = env.insert_new_variable(member_name.address);

      const variable_address = UserVariable.allocate(
        heap,
        member_type,
        PrimitiveNil.allocate_default(heap)
      );
      const variable = new UserVariable(heap, variable_address);
      entry.set_variable_address(variable);
      variable.free();
    }

    return address;
  }

  public stringify_i(): string {
    let result = "{";
    const env = new EnvironmentFrame(this.heap, this.get_child(0));
    result += env.stringify();
    result += "}";
    return result;
  }
}

export { UserStruct };
