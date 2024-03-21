import { ContextControl } from '../../heap/types/context/control';
import { ContextStash } from '../../heap/types/context/stash';
import { ContextEnv } from '../../heap/types/context/env';
import { Heap } from '../../heap';
import { ControlFunction } from '../../heap/types/control/function';
import { ComplexFunction } from '../../heap/types/complex/function';
import { auto_cast } from '../../heap/types/auto_cast';
import { ControlCall } from '../../heap/types/control/call';
import { ControlCallI } from '../../heap/types/control/call_i';
import { TAG_CONTROL_exit_scope_i } from '../../heap/types/tags';
import { ControlReturn } from '../../heap/types/control/return';
import { ControlReturnI } from '../../heap/types/control/return_i';
import { ControlRestoreEnvI } from '../../heap/types/control/restore_env_i';

function evaluate_function(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const cmd_object = auto_cast(heap, cmd) as ControlFunction;
    const function_object = ComplexFunction.allocate(heap, cmd_object.address, E.get_frame().address);
    S.push(function_object);
}

function evaluate_call(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const cmd_object = auto_cast(heap, cmd) as ControlCall;
    const name = cmd_object.get_name_address();
    const function_object = E.get_frame().get_variable_value_address(name.address) as ComplexFunction;

    S.push(function_object.address);

    if (function_object.get_number_of_params() !== cmd_object.get_number_of_args()) {
        throw new Error("Number of parameters does not match");
    }

    const call_i_cmd = heap.allocate_any({ tag: "call_i", num_args: cmd_object.get_number_of_args() });
    C.push(call_i_cmd);

    for (let i = 0; i < cmd_object.get_number_of_args(); i++) {
        const arg = cmd_object.get_arg_address(i);
        C.push(arg.address);
    }
}

function evaluate_call_i(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const cmd_object = auto_cast(heap, cmd) as ControlCallI;

    // Pop arguments from the stash
    let args = [];
    for (let i = 0; i < cmd_object.get_number_of_args(); i++) {
        args.push(S.pop());
    }

    const function_object = auto_cast(heap, S.pop()) as ComplexFunction;

    // Push restore environment command
    const E_copy = E.get_frame().reference();
    const restore_env_cmd = heap.allocate_any({ tag: "restore-env_i", frame: E_copy });
    C.push(restore_env_cmd);

    // Set the environment
    E.set_frame(function_object.get_environment_address());

    // Extend the environment with the parameters
    E.push_frame();
    for (let i = 0; i < function_object.get_number_of_params(); i++) {
        const param_name = function_object.get_param_name_address(i);
        E.get_frame().insert_new_variable(param_name.address);
        E.get_frame().set_variable_value_address(param_name.address, args[i]);
    }

    // Push the body
    C.push(function_object.get_body_address().address);
}

function evaluate_return(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const cmd_object = auto_cast(heap, cmd) as ControlReturn;
    const return_i_cmd = heap.allocate_any({ tag: "return_i" });
    C.push(return_i_cmd);
    const value = cmd_object.get_expression_address();
    C.push(value.address);
}

function evaluate_return_i(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const cmd_object = auto_cast(heap, cmd) as ControlReturnI;
    const top_cmd = auto_cast(heap, C.pop());
    if (top_cmd.get_tag() === TAG_CONTROL_exit_scope_i) {
        C.push(top_cmd.reference().address);
    } else {
        if (top_cmd.get_tag() === TAG_CONTROL_exit_scope_i) {
            E.pop_frame();
        }
        C.push(cmd_object.reference().address);
    }
}

function evaluate_restore_env_i(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const cmd_object = auto_cast(heap, cmd) as ControlRestoreEnvI;

    // Pop the frame
    E.pop_frame();

    // Restore the environment
    const env = cmd_object.get_frame_address();
    E.set_frame(env);
}

export {
    evaluate_function,
    evaluate_call,
    evaluate_call_i,
    evaluate_return,
    evaluate_return_i,
    evaluate_restore_env_i,
};