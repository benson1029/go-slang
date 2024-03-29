import { ContextControl } from '../../heap/types/context/control';
import { ContextStash } from '../../heap/types/context/stash';
import { ContextEnv } from '../../heap/types/context/env';
import { Heap } from '../../heap';
import { ControlMember } from '../../heap/types/control/member';
import { UserStruct } from '../../heap/types/user/struct';
import { auto_cast } from '../../heap/types/auto_cast';
import { ControlMemberI } from '../../heap/types/control/member_i';

function evaluate_member(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const member_cmd = new ControlMember(heap, cmd);
    const value = member_cmd.get_object();
    const member_i_addr = heap.allocate_any({ tag: "member_i", member: member_cmd.get_member_name_address() });
    C.push(member_i_addr);
    C.push(value.address);
    heap.free_object(member_i_addr);
}

function evaluate_member_i(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const member_i_cmd = new ControlMemberI(heap, cmd);
    const member_name = member_i_cmd.get_member_name_address();
    const object = auto_cast(heap, S.pop()) as unknown as UserStruct;
    const member = object.get_frame().get_variable_address(member_name.address);
    const value = member.get_value();
    S.push(value.address);
    object.free();
}

export {
    evaluate_member,
    evaluate_member_i,
};
