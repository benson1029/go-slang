import { ContextControl } from '../../heap/types/context/control';
import { ContextStash } from '../../heap/types/context/stash';
import { ContextEnv } from '../../heap/types/context/env';
import { Heap } from '../../heap';
import { ControlFunction } from '../../heap/types/control/function';
import { ComplexFunction } from '../../heap/types/complex/function';
import { auto_cast } from '../../heap/types/auto_cast';
import { ControlCall } from '../../heap/types/control/call';
import { ControlCallI } from '../../heap/types/control/call_i';
import { TAG_COMPLEX_builtin, TAG_COMPLEX_function, TAG_COMPLEX_method, TAG_CONTROL_exit_scope_i, TAG_CONTROL_restore_env_i, TAG_PRIMITIVE_nil } from '../../heap/types/tags';
import { ControlReturn } from '../../heap/types/control/return';
import { ControlReturnI } from '../../heap/types/control/return_i';
import { ControlRestoreEnvI } from '../../heap/types/control/restore_env_i';
import { evaluate_builtin } from './builtin';
import { ComplexBuiltin } from '../../heap/types/complex/builtin';
import { ControlCallStmt } from '../../heap/types/control/call_stmt';
import { ControlPushI } from '../../heap/types/control/push_i';
import { UserStruct } from '../../heap/types/user/struct';
import { ComplexMethod } from '../../heap/types/complex/method';
import { ContextThread } from '../../heap/types/context/thread';
import { ContextScheduler } from '../../heap/types/context/scheduler';

function evaluate_function(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const cmd_object = auto_cast(heap, cmd) as ControlFunction;
    const function_object = ComplexFunction.allocate(heap, cmd_object.address, E.get_frame().address);
    S.push(function_object);
    heap.free_object(function_object);
}

function evaluate_call(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const cmd_object = auto_cast(heap, cmd) as ControlCall;
    const function_object = cmd_object.get_func_address();

    const call_i_cmd = heap.allocate_any({ tag: "call_i", num_args: cmd_object.get_number_of_args() });
    C.push(call_i_cmd);
    heap.free_object(call_i_cmd);

    for (let i = 0; i < cmd_object.get_number_of_args(); i++) {
        const arg = cmd_object.get_arg_address(i);
        C.push(arg.address);
    }

    C.push(function_object.address);
}

function evaluate_call_i(cmd: number, heap: Heap, thread: ContextThread, scheduler: ContextScheduler, output: Function): void {
    const C = thread.control();
    const S = thread.stash();
    const E = thread.env();

    const cmd_object = auto_cast(heap, cmd) as ControlCallI;

    // Pop arguments from the stash
    let args = [];
    for (let i = 0; i < cmd_object.get_number_of_args(); i++) {
        args.push(S.pop());
    }

    const function_object = auto_cast(heap, S.pop()) as ComplexFunction;

    // We need to free args[] and function_object later
    const deferred_free = () => {
        function_object.free();
        for (let arg of args) {
            heap.free_object(arg);
        }
    };

    if (function_object.get_tag() === TAG_COMPLEX_function) {
        if (function_object.get_number_of_params() !== cmd_object.get_number_of_args()) {
            deferred_free();
            throw new Error("Number of parameters does not match");
        }
    } else if (function_object.get_tag() === TAG_COMPLEX_builtin) {
        // Do nothing
    } else if (function_object.get_tag() === TAG_COMPLEX_method) {
        if (function_object.get_number_of_params() !== cmd_object.get_number_of_args()) {
            deferred_free();
            throw new Error("Number of parameters does not match");
        }
    } else {
        deferred_free();
        throw new Error("Object is not callable");
    }

    if (function_object.get_tag() === TAG_COMPLEX_builtin) {
        const name = (function_object as unknown as ComplexBuiltin).get_name();
        evaluate_builtin(name, heap, C, S, E, thread, scheduler, output, args);
        deferred_free();
        return;
    }

    // Push restore environment command
    const restore_env_cmd = heap.allocate_any({ tag: "restore-env_i", frame: E.get_frame() });
    C.push(restore_env_cmd);
    heap.free_object(restore_env_cmd);

    // Push dummy return command
    const return_cmd = heap.allocate_any({ tag: "return", value: 0 });
    C.push(return_cmd);
    heap.free_object(return_cmd);

    // Set the environment
    E.set_frame(function_object.get_environment_address());

    // Extend the environment with the parameters
    E.push_frame();
    for (let i = 0; i < function_object.get_number_of_params(); i++) {
        const param_name = function_object.get_param_name_address(i);
        E.get_frame().insert_new_variable(param_name.address);
        const variable = E.get_frame().get_variable_address(param_name.address);
        variable.set_value(auto_cast(heap, args[i]));
    }

    // Handle self parameter in struct
    if (function_object.get_tag() === TAG_COMPLEX_method) {
        const self = auto_cast(heap, S.pop()) as UserStruct;
        const self_name = (function_object as ComplexMethod).get_self_name_address();
        E.get_frame().insert_new_variable(self_name.address);
        const variable = E.get_frame().get_variable_address(self_name.address);
        variable.set_value(self);
        self.free();
    }

    // Push the body
    C.push(function_object.get_body_address().address);

    deferred_free();
    scheduler.enqueue(thread);
}

function evaluate_return(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const cmd_object = auto_cast(heap, cmd) as ControlReturn;
    const return_i_cmd = heap.allocate_any({ tag: "return_i" });
    C.push(return_i_cmd);
    heap.free_object(return_i_cmd);
    const value = cmd_object.get_expression_address();
    if (value.get_tag() === TAG_PRIMITIVE_nil) {
        S.push(value.address);
    } else {
        C.push(value.address);
    }
}

function evaluate_return_i(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const cmd_object = auto_cast(heap, cmd) as ControlReturnI;
    const top_cmd = auto_cast(heap, C.pop()); // owner
    if (top_cmd.get_tag() === TAG_CONTROL_restore_env_i) {
        C.push(top_cmd.address);
    } else {
        if (top_cmd.get_tag() === TAG_CONTROL_exit_scope_i) {
            E.pop_frame();
        }
        C.push(cmd_object.address);
    }
    top_cmd.free();
}

function evaluate_restore_env_i(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const cmd_object = auto_cast(heap, cmd) as ControlRestoreEnvI;

    // Pop the frame
    E.pop_frame();

    // Restore the environment
    const env = cmd_object.get_frame_address();
    E.set_frame(env);
}

function evaluate_call_stmt(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const cmd_object = auto_cast(heap, cmd) as ControlCallStmt;
    const body = cmd_object.get_body_address();
    const pop_i_cmd = heap.allocate_any({ tag: "pop_i" });
    C.push(pop_i_cmd);
    C.push(body.address);
    heap.free_object(pop_i_cmd);
}

function evaluate_pop_i(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const obj = auto_cast(heap, S.pop());
    obj.free();
}

function evaluate_push_i(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const cmd_object = auto_cast(heap, cmd) as ControlPushI;
    S.push(cmd_object.get_object_address());
}

export {
    evaluate_function,
    evaluate_call,
    evaluate_call_i,
    evaluate_return,
    evaluate_return_i,
    evaluate_restore_env_i,
    evaluate_call_stmt,
    evaluate_pop_i,
    evaluate_push_i,
};
