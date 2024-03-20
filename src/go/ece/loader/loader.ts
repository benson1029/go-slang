import { Heap } from "../../heap";
import { Control } from "../control";
import { Env } from "../env";
import { Stash } from "../stash";
import { sort_global_declarations } from "./globalSort";

/**
 * Performs checking on the program and loads the program into the ECE
 * environment.
 */
function load(program: any, C: Control, S: Stash, E: Env, heap: Heap) {
    sort_global_declarations(program);

    // Stub for loading the main function directly:
    let main = program.body.filter((x: any) => x.tag === "function" && x.name === "main")[0];
    const _main_addr = heap.allocate_any(main.body.body)
    C.push(_main_addr)

    return;

    let cmdAddr = {};
    program.body.forEach((cmd) => {
        const addr = heap.allocate_any(cmd);
        cmdAddr[cmd.name] = addr;
    })
    let C_data = []
    program.body.forEach((cmd) => {
        if (cmd.tag === 'var') {
            C_data.push(cmdAddr[cmd.name])
        }
    })
    const main_addr = heap.allocate_any({ tag: "call", name: "main", args: [] });
    C_data.push(main_addr);
    for (let i = C_data.length - 1; i >= 0; i--) {
        C.push(C_data[i]);
    }
}

export { load };
