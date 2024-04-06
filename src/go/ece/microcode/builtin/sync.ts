import { Heap } from '../../../heap';
import { NilType, Type } from '../../loader/typeUtil';
import { auto_cast } from '../../../heap/types/auto_cast';
import { UserStruct } from '../../../heap/types/user/struct';
import { ComplexString } from '../../../heap/types/complex/string';
import { ComplexMutex } from '../../../heap/types/complex/mutex';
import { ContextThread } from '../../../heap/types/context/thread';
import { ContextScheduler } from '../../../heap/types/context/scheduler';
import { PrimitiveNil } from '../../../heap/types/primitive/nil';

function evaluate_builtin(name: string, heap: Heap, thread: ContextThread, scheduler: ContextScheduler, output: Function, args: number[]): void {
    const S = thread.stash();

    if (name === "MutexLock") {
        const struct = auto_cast(heap, S.pop()) as UserStruct;
        const mutex_string = ComplexString.allocate(heap, "INTERNAL.mutex");
        const mutex = struct.get_frame().get_variable_address(mutex_string).get_value() as ComplexMutex;
        mutex.lock(thread, scheduler);
        S.push(PrimitiveNil.allocate());
        heap.free_object(mutex_string);
        struct.free();
    }
    else if (name === "MutexUnlock") {
        const struct = auto_cast(heap, S.pop()) as UserStruct;
        const mutex_string = ComplexString.allocate(heap, "INTERNAL.mutex");
        const mutex = struct.get_frame().get_variable_address(mutex_string).get_value() as ComplexMutex;
        mutex.unlock(scheduler);
        scheduler.enqueue(thread);
        S.push(PrimitiveNil.allocate());
        heap.free_object(mutex_string);
        struct.free();
    }
    else {
        throw new Error("evaluate_builtin: Builtin not found");
    }
}

function get_builtin_type(name: string, args: Type[]): Type {
    if (name === "MutexLock") {
        return new NilType();
    } else if (name === "MutexUnlock") {
        return new NilType();
    }
    throw new Error("get_builtin_type: Builtin not found");
}

function link_imports(name: string): { type: string; name: string; value: any }[] {
    let imports = []
    if (name === "" || name === "Mutex") {
        imports.push({ type: "struct", name: "STRUCT.sync.Mutex", value: {
            tag: "struct-type",
            name: "sync.Mutex",
            members: [
                { name: "INTERNAL.mutex", type: { tag: "mutex-type" } },
            ],
            functions: [
                { name: "Lock", value: { tag: "builtin", name: "sync.MutexLock" } },
                { name: "Unlock", value: { tag: "builtin", name: "sync.MutexUnlock" } },
            ]
        } });
    }
    return imports;
}

export {
    evaluate_builtin,
    get_builtin_type,
    link_imports,
};
