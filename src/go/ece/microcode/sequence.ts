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
    const seq_object_copy = seq_object.copy();
    const new_seq_object = new ControlSequence(heap, seq_object_copy.address);
    new_seq_object.remove_first_linked_list_element();
    // TODO: Remove the following line after Rama fixes the bug in get_linked_list_address
    new_seq_object.get_linked_list_address().reference();
    C.push(new_seq_object.address);
    C.push(value.address);
}

export { evaluate_sequence };
