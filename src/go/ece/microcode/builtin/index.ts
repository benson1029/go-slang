import { ContextControl } from '../../../heap/types/context/control';
import { ContextStash } from '../../../heap/types/context/stash';
import { ContextEnv } from '../../../heap/types/context/env';
import { Heap } from '../../../heap';
import { auto_cast } from '../../../heap/types/auto_cast';
import { Primitive } from '../../../heap/types/primitive';
import { TAG_COMPLEX_string } from '../../../heap/types/tags';
import { ComplexString } from '../../../heap/types/complex/string';

function evaluate_builtin(name: string, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv, output: Function, args: number[]): void {
    // Stub for now
    if (name === "fmt.Println") {
        args.forEach((addr) => {
            const value = auto_cast(heap, addr);
            if (value.get_tag() === TAG_COMPLEX_string) {
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
            { name: "fmt.Println", value: { tag: "builtin", name: "fmt.Println" } },
        ];
    }
    return [];
}

export {
    evaluate_builtin,
    link_imports,
};