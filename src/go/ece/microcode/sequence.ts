import { Control } from '../control';
import { Stash } from '../stash';
import { Env } from '../env';
import { Heap } from '../../heap';

function evaluate_sequence(cmd: any, heap: Heap, C: Control, S: Stash, E: Env) {
    const stmts = cmd.stmts;
    for (let i = stmts.length - 1; i >= 0; i--) {
        C.push(stmts[i]);
    }
    return E;
}

export { evaluate_sequence };
