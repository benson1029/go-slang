import { ContextControl } from '../../../heap/types/context/control';
import { ContextStash } from '../../../heap/types/context/stash';
import { ContextEnv } from '../../../heap/types/context/env';
import { Heap } from '../../../heap';
import { auto_cast } from '../../../heap/types/auto_cast';
import { TAG_COMPLEX_array } from '../../../heap/types/tags';
import { ComplexArray } from '../../../heap/types/complex/array';
import { ArrayType, Int32Type, SliceType, Type } from '../../loader/typeUtil';

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

function get_builtin_type(name: string, args: Type[]): Type {
    if (name === "len") {
        if (args.length === 1) {
            if (args[0] instanceof ArrayType || args[0] instanceof SliceType) {
                return new Int32Type();
            }
            throw new Error("len: Argument is not an array or slice");
        }
        throw new Error("len: Expected 1 argument");
    }
    throw new Error("get_builtin_type: Builtin not found");
}

function link_imports(): { name: string; value: any }[] {
    return [
        { name: "append", value: "default.append" },
        { name: "len", value: "default.len" },
    ];
}

export {
    evaluate_builtin,
    get_builtin_type,
    link_imports,
};
