import { ContextControl } from '../../heap/types/context/control';
import { ContextEnv } from '../../heap/types/context/env';
import { ContextStash } from '../../heap/types/context/stash';
import { Heap } from '../../heap';
import { ControlMake } from '../../heap/types/control/make';
import { auto_cast } from '../../heap/types/auto_cast';
import { TAG_USER_type_array } from '../../heap/types/tags';
import { ComplexArray } from '../../heap/types/complex/array';
import { UserTypeArray } from '../../heap/types/user/type/array';
import { UserVariable } from '../../heap/types/user/variable';

function evaluate_make(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const make_cmd = auto_cast(heap, cmd) as ControlMake;
    const type = make_cmd.get_type();

    switch (type.get_tag()) {
        case TAG_USER_type_array: {
            const type_casted = type as UserTypeArray;
            const array = auto_cast(heap, ComplexArray.allocate(heap, type_casted.get_length())) as ComplexArray;
            for (let i = 0; i < type_casted.get_length(); i++) {
                const variable = auto_cast(heap, UserVariable.allocate_nil(heap)) as UserVariable;
                type_casted.get_inner_type().construct_default(variable);
                array.set_value_address(i, variable);
                variable.free();
            }
            S.push(array.address);
            array.free();
            break;
        }
        default:
            throw new Error("evaluate_make: Invalid type");
    }
}

export {
    evaluate_make,
};