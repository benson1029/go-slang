import { ContextControl } from '../../../heap/types/context/control';
import { ContextStash } from '../../../heap/types/context/stash';
import { ContextEnv } from '../../../heap/types/context/env';
import { Heap } from '../../../heap';
import * as default_builtins from './default';
import * as fmt from './fmt';
import * as sync from './sync';
import { Type } from '../../loader/typeUtil';
import { ContextThread } from '../../../heap/types/context/thread';
import { ContextScheduler } from '../../../heap/types/context/scheduler';

function evaluate_builtin(name: string, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv,
        thread: ContextThread, scheduler: ContextScheduler, output: Function, args: number[]): void {
    if (name.startsWith("fmt.")) {
        fmt.evaluate_builtin(name.substring(4), heap, C, S, E, output, args);
        scheduler.enqueue(thread);
    }
    else if (name.startsWith("default.")) {
        default_builtins.evaluate_builtin(name.substring(8), heap, C, S, E, output, args);
        scheduler.enqueue(thread);
    }
    else if (name.startsWith("sync.")) { // concurrent builtins
        sync.evaluate_builtin(name.substring(5), heap, thread, scheduler, output, args);
    }
    else {
        throw new Error("evaluate_builtin: Builtin not found");
    }
}

function get_builtin_type(name: string, args: Type[]): Type {
    if (name.startsWith("fmt.")) {
        return fmt.get_builtin_type(name.substring(4), args);
    }
    else if (name.startsWith("default.")) {
        return default_builtins.get_builtin_type(name.substring(8), args);
    }
    else if (name.startsWith("sync.")) {
        return sync.get_builtin_type(name.substring(5), args);
    }
    throw new Error("get_builtin_type: Builtin not found");
}

function link_imports(name: string): { type: string; name: string; value: any }[] {
    if (name.startsWith("fmt")) {
        return fmt.link_imports(name.substring(4));
    }
    if (name.startsWith("sync")) {
        return sync.link_imports(name.substring(5));
    }
    if (name.startsWith("default")) {
        return default_builtins.link_imports();
    }
    throw new Error("link_imports: Builtin not found");
}

export {
    evaluate_builtin,
    get_builtin_type,
    link_imports,
};