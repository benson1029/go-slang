import { Heap } from "../../heap";
import { ContextControl } from "../../heap/types/context/control";
import { ContextEnv } from "../../heap/types/context/env";
import { ContextStash } from "../../heap/types/context/stash";
import { sort_global_declarations } from "./globalSort";
import { preprocess_program } from "./preprocess";

/**
 * Performs checking on the program and loads the program into the ECE
 * environment.
 */
function load(program: any, C: ContextControl, S: ContextStash, E: ContextEnv, heap: Heap, imports: any[]) {
    preprocess_program(program, imports);
    sort_global_declarations(program, imports);

    const main_addr = heap.allocate_any({ tag: "call", name: "main", args: [] });
    C.push(main_addr);
    for (let i = program.body.length - 1; i >= 0; i--) {
        if (program.body[i].tag === "function") {
            program.body[i] = {
                tag: "var",
                name: program.body[i].name,
                value: program.body[i],
            }
        }
        const addr = heap.allocate_any(program.body[i]);
        C.push(addr);
    }
}

export { load };
