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
function load(program: any, C: ContextControl, S: ContextStash, E: ContextEnv, heap: Heap) {
    preprocess_program(program);
    sort_global_declarations(program);

    // // Stub for loading the main function directly:
    // let main = program.body.filter((x: any) => x.tag === "function" && x.name === "main")[0];
    // const _main_addr = heap.allocate_any(main.body.body);
    // C.push(_main_addr);
    // heap.free_object(_main_addr);

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
