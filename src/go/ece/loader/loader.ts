/* eslint-disable no-unreachable */
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

    // Stub for loading the main function directly:
    let main = program.body.filter((x: any) => x.tag === "function" && x.name === "main")[0];
    const _main_addr = heap.allocate_any(main.body.body)
    C.push(_main_addr)
    heap.free_object(_main_addr)

    return;

    // let cmdAddr = {};
    // program.body.forEach((cmd) => {
    //     const addr = heap.allocate_any(cmd);
    //     cmdAddr[cmd.name] = addr;
    // })
    // let C_data = []
    // program.body.forEach((cmd) => {
    //     if (cmd.tag === 'var') {
    //         C_data.push(cmdAddr[cmd.name])
    //     }
    // })
    // const main_addr = heap.allocate_any({ tag: "call", name: "main", args: [] });
    // C_data.push(main_addr);
    // for (let i = C_data.length - 1; i >= 0; i--) {
    //     C.push(C_data[i]);
    // }
}

export { load };
