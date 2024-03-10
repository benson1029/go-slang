import { Control } from '../control';
import { Stash } from '../stash';
import { Env } from '../env';
import { Heap } from '../../heap';

function evaluate_sequence(cmd: any, heap: Heap, C: Control, S: Stash, E: Env) {
    const body = cmd.body;
    for (let i = body.length - 1; i >= 0; i--) {
        C.push(body[i]);
    }
    return E;
}

export { evaluate_sequence };
