import { ContextControl } from '../../../heap/types/context/control';
import { ContextStash } from '../../../heap/types/context/stash';
import { ContextEnv } from '../../../heap/types/context/env';
import { Heap } from '../../../heap';
import { auto_cast } from '../../../heap/types/auto_cast';
import { Primitive } from '../../../heap/types/primitive';
import { TAG_COMPLEX_array, TAG_COMPLEX_string } from '../../../heap/types/tags';
import { ComplexString } from '../../../heap/types/complex/string';
import { ComplexArray } from '../../../heap/types/complex/array';
import { UserVariable } from '../../../heap/types/user/variable';
import { HeapObject } from '../../../heap/types/objects';
import { NilType, Type } from '../../loader/typeUtil';

function print(heap: Heap, output: Function, obj: HeapObject): void {
    if (obj.get_tag() === TAG_COMPLEX_array) {
        const array = obj as ComplexArray;
        output("[");
        for (let i = 0; i < array.get_length(); i++) {
            if (i > 0) output(" ");
            print(heap, output, (array.get_value_address(i) as UserVariable).get_value());
        }
        output("]");
    } else if (obj.get_tag() === TAG_COMPLEX_string) {
        output((obj as ComplexString).get_string());
    } else {
        output((obj as Primitive).get_value());
    }
}

function evaluate_builtin(name: string, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv, output: Function, args: number[]): void {
    if (name === "Print") {
        args.forEach((addr, index) => {
            const value = auto_cast(heap, addr);
            print(heap, output, value);
        });
    } else if (name === "Println") {
        args.forEach((addr, index) => {
            if (index > 0) output(" ");
            const value = auto_cast(heap, addr);
            print(heap, output, value);
        });
        output("\n");
    } else {
        throw new Error("evaluate_builtin: Builtin not found");
    }
}

function get_builtin_type(name: string, args: Type[]): Type {
    if (name === "Print" || name === "Println") {
        return new NilType();
    }
    throw new Error("get_builtin_type: Builtin not found");
}

function link_imports(name: string): { name: string; value: any }[] {
    let imports = []
    if (name === "" || name === "Print") {
        imports.push({ name: "Print", value: "fmt.Print" });
    }
    if (name === "" || name === "Println") {
        imports.push({ name: "Println", value: "fmt.Println" });
    }
    return [ { name: "fmt", value: imports } ];
}

export {
    evaluate_builtin,
    get_builtin_type,
    link_imports,
};
