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
function load(
  program: any,
  C: ContextControl,
  S: ContextStash,
  E: ContextEnv,
  heap: Heap,
  imports: any[],
) {
  preprocess_program(program, imports);
  sort_global_declarations(program, imports, true);
  preprocess_program(program, imports, true);
  sort_global_declarations(program, imports, false);

  // // Stub for loading the main function directly:
  // let main = program.body.filter((x: any) => x.tag === "function" && x.name === "main")[0];
  // const _main_addr = heap.allocate_any(main.body.body);
  // C.push(_main_addr);
  // heap.free_object(_main_addr);

  const main_addr = heap.allocate_any({
    tag: "call-stmt",
    body: { tag: "call", func: { tag: "name", name: "main" }, args: [] }
  });
  C.push(main_addr);
  heap.free_object(main_addr);
  for (let phase = 0; phase < 2; phase++) {
    for (let i = program.body.length - 1; i >= 0; i--) {
      if (phase === 0) {
        if (program.body[i].tag !== "struct") {
          const addr =
            program.body[i].tag === "function"
              ? heap.allocate_any({
                  tag: "assign",
                  name: {
                    tag: "name-address",
                    name: program.body[i].name
                  },
                  value: program.body[i],
                })
              : heap.allocate_any(program.body[i]);
          C.push(addr);
          heap.free_object(addr);
        }
      } else {
        if (program.body[i].tag === "struct") {
          const addr = heap.allocate_any(program.body[i]);
          C.push(addr);
          heap.free_object(addr);
        }
        if (program.body[i].tag === "function") {
          const addr = heap.allocate_any({
            tag: "var",
            name: program.body[i].name,
            value: {
              tag: "function",
              name: null,
              params: [],
              captures: [],
              body: {
                tag: "block",
                body: {
                    tag: "sequence",
                    body: []
                }
              },
            },
          });
          C.push(addr);
          heap.free_object(addr);
        }
      }
    }
  }
}

export { load };
