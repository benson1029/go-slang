import { ContextControl } from '../../../heap/types/context/control';
import { ContextStash } from '../../../heap/types/context/stash';
import { ContextEnv } from '../../../heap/types/context/env';
import { Heap } from '../../../heap';
import { auto_cast } from '../../../heap/types/auto_cast';
import { TAG_COMPLEX_array } from '../../../heap/types/tags';
import { ComplexArray } from '../../../heap/types/complex/array';

function evaluate_builtin(name: string, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv, output: Function, args: number[]): void {
    if (name === "len") {
        const array = auto_cast(heap, args[0]);
        if (array.get_tag() === TAG_COMPLEX_array) {
            const len = (array as ComplexArray).get_length();
            const value = heap.allocate_PRIMITIVE_int32(len);
            S.push(value);
            heap.free_object(value);
        }
    } else {
        throw new Error("evaluate_builtin: Builtin not found");
    }
}

function link_imports(): { name: string; value: any }[] {
    return [
        { name: "append", value: "default.append" },
        { name: "len", value: "default.len" },
    ];
}

export {
    evaluate_builtin,
    link_imports,
};
