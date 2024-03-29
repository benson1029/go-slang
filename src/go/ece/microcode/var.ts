import { Heap } from "../../heap";
import { auto_cast } from "../../heap/types/auto_cast";
import { ControlAssign } from "../../heap/types/control/assign";
import { ControlAssignI } from "../../heap/types/control/assign_i";
import { ControlName } from "../../heap/types/control/name";
import { ControlVar } from "../../heap/types/control/var";
import { ControlVarI } from "../../heap/types/control/var_i";
import { Primitive } from "../../heap/types/primitive";
import { ContextControl } from '../../heap/types/context/control';
import { ContextEnv } from '../../heap/types/context/env';
import { ContextStash } from '../../heap/types/context/stash';
import { UserVariable } from "../../heap/types/user/variable";
import { ControlNameAddress } from "../../heap/types/control/name_address";

function evaluate_var(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const var_object = new ControlVar(heap, cmd);
    const expression = var_object.get_expression();
    const var_i_addr = heap.allocate_any({ tag: "var_i", name: var_object.get_name_address() });
    C.push(var_i_addr);
    C.push(expression.address);
    heap.free_object(var_i_addr);
}

function evaluate_var_i(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const var_i_object = new ControlVarI(heap, cmd);
    const name = var_i_object.get_name_address();
    E.get_frame().insert_new_variable(name.address);
    const value = auto_cast(heap, S.pop()) as unknown as Primitive;
    const variable = E.get_frame().get_variable_address(name.address);
    variable.set_value(value);
    value.free();
}

function evaluate_name(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const name_object = new ControlName(heap, cmd);
    const name = name_object.get_name_address();
    const variable = E.get_frame().get_variable_address(name.address);
    const value = variable.get_value();
    S.push(value.address);
}

function evaluate_assign(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const assign_object = new ControlAssign(heap, cmd);
    const name_expression = assign_object.get_name();
    const value_expression = assign_object.get_expression();
    const assign_i_addr = heap.allocate_any({ tag: "assign_i" });
    C.push(assign_i_addr);
    C.push(name_expression.address);
    C.push(value_expression.address);
    heap.free_object(assign_i_addr);
}

function evaluate_assign_i(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const variable = auto_cast(heap, S.pop()) as unknown as UserVariable;
    const value = auto_cast(heap, S.pop()) as unknown as Primitive;
    variable.set_value(value);
    value.free();
}

function evaluate_name_address(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const name_address_object = new ControlNameAddress(heap, cmd);
    const name = name_address_object.get_name_address();
    const variable = E.get_frame().get_variable_address(name.address);
    S.push(variable.address);
}

export {
    evaluate_var,
    evaluate_var_i,
    evaluate_name,
    evaluate_assign,
    evaluate_assign_i,
    evaluate_name_address,
};
