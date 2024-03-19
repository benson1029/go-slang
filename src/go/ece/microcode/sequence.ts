import { Control } from '../control';
import { Stash } from '../stash';
import { Env } from '../env';
import { Heap } from '../../heap';
import { ControlSequence } from '../../heap/types/control/sequence';

function evaluate_sequence(cmd: number, heap: Heap, C: Control, S: Stash, E: Env): void {
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
