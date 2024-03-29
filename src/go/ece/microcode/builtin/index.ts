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

function evaluate_builtin(name: string, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv, output: Function, args: number[]): void {
    // Stub for now
    if (name === "fmt.Println") {
        args.forEach((addr, index) => {
            if (index > 0) output(" ");
            const value = auto_cast(heap, addr);
            if (value.get_tag() === TAG_COMPLEX_array) {
                output("[");
                const array = value as ComplexArray;
                for (let i = 0; i < array.get_length(); i++) {
                    if (i > 0) output(" ");
                    const inner_value = (array.get_value_address(i) as UserVariable).get_value();
                    if (inner_value.get_tag() === TAG_COMPLEX_string) {
                        output((inner_value as ComplexString).get_string());
                    } else {
                        output((inner_value as Primitive).get_value());
                    }
                }
                output("]");
            } else if (value.get_tag() === TAG_COMPLEX_string) {
                output((value as ComplexString).get_string());
            } else {
                output((value as Primitive).get_value());
            }
        });
        output("\n");
    }
}

function link_imports(name: string): { name: string; value: any }[] {
    // Stub for now
    if (name === "fmt") {
        return [
            { name: "fmt", value: [
                { name: "Println", value: "fmt.Println" },
            ] },
        ];
    }
    return [];
}

export {
    evaluate_builtin,
    link_imports,
};