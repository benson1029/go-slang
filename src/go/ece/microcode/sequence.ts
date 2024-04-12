import { ContextControl } from '../../heap/types/context/control';
import { ContextEnv } from '../../heap/types/context/env';
import { ContextStash } from '../../heap/types/context/stash';
import { Heap } from '../../heap';
import { ControlSequence } from '../../heap/types/control/sequence';

function evaluate_sequence(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const seq_object = new ControlSequence(heap, cmd);
    const linked_list = seq_object.get_linked_list_address();
    if (linked_list.is_nil()) {
        return;
    }
    const value = linked_list.get_value_address().reference();
    const seq_object_copy = seq_object.copy() as ControlSequence;
    seq_object_copy.pop_front();
    C.push(seq_object_copy.address);
    C.push(value.address);
    value.free();
    seq_object_copy.free();
}

export { evaluate_sequence };
