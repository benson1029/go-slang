import { ContextControl } from '../../../heap/types/context/control';
import { ContextStash } from '../../../heap/types/context/stash';
import { ContextEnv } from '../../../heap/types/context/env';
import { Heap } from '../../../heap';
import * as default_builtins from './default';
import * as fmt from './fmt';

function evaluate_builtin(name: string, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv, output: Function, args: number[]): void {
    if (name.startsWith("fmt.")) {
        fmt.evaluate_builtin(name.substring(4), heap, C, S, E, output, args);
    }
    else if (name.startsWith("default.")) {
        default_builtins.evaluate_builtin(name.substring(8), heap, C, S, E, output, args);
    }
    else {
        throw new Error("evaluate_builtin: Builtin not found");
    }
}

function link_imports(name: string): { name: string; value: any }[] {
    if (name.startsWith("fmt")) {
        return fmt.link_imports(name.substring(4));
    }
    return [];
}

function get_default_imports(): { name: string; value: any }[] {
    return default_builtins.link_imports();
}

export {
    evaluate_builtin,
    link_imports,
    get_default_imports,
};