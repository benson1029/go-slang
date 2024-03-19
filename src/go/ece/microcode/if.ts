import { Control } from '../control';
import { Stash } from '../stash';
import { Env } from '../env';
import { Heap } from '../../heap';
import { ControlIf } from '../../heap/types/control/if';
import { ControlIfI } from '../../heap/types/control/if_i';
import { auto_cast } from '../../heap/types/auto_cast';
import { PrimitiveBool } from '../../heap/types/primitive/bool';

function evaluate_if(cmd: number, heap: Heap, C: Control, S: Stash, E: Env): void {
    const cmd_object = new ControlIf(heap, cmd);
    const condition = cmd_object.get_condition_address().reference();
    const then_body = cmd_object.get_then_body_address();
    const else_body = cmd_object.get_else_body_address();
    const if_i_cmd = heap.allocate_any({
        tag: "if_i",
        condition: condition.address,
        then_body: then_body,
        else_body: else_body,
    });
    C.push(if_i_cmd);
    C.push(condition.address);
}

function evaluate_if_i(cmd: number, heap: Heap, C: Control, S: Stash, E: Env): void {
    const cmd_object = new ControlIfI(heap, cmd);
    const then_body = cmd_object.get_then_body_address();
    const else_body = cmd_object.get_else_body_address();
    const condition_value = auto_cast(heap, S.pop()) as unknown as PrimitiveBool;
    if (condition_value.get_value()) {
        C.push(then_body.reference().address);
    } else {
        C.push(else_body.reference().address);
    }
}

export {
    evaluate_if,
    evaluate_if_i,
};
