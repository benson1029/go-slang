import { Heap } from '../../../heap';
import { Int32Type, NilType, Type } from '../../loader/typeUtil';
import { auto_cast } from '../../../heap/types/auto_cast';
import { UserStruct } from '../../../heap/types/user/struct';
import { ComplexString } from '../../../heap/types/complex/string';
import { ComplexMutex } from '../../../heap/types/complex/mutex';
import { ContextThread } from '../../../heap/types/context/thread';
import { ContextScheduler } from '../../../heap/types/context/scheduler';
import { PrimitiveNil } from '../../../heap/types/primitive/nil';
import { PrimitiveInt32 } from '../../../heap/types/primitive/int32';
import { ComplexWaitGroup } from '../../../heap/types/complex/wait_group';

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
    else if (name === "WaitGroupAdd") {
        const struct = auto_cast(heap, S.pop()) as UserStruct;
        const waitGroup_string = ComplexString.allocate(heap, "INTERNAL.waitGroup");
        const waitGroup = struct.get_frame().get_variable_address(waitGroup_string).get_value() as ComplexWaitGroup;
        const value = auto_cast(heap, args[0]) as PrimitiveInt32;
        if (value.get_value() < 0) {
            throw new Error("WaitGroup.Add(): Negative value");
        }
        waitGroup.add(value.get_value(), scheduler);
        scheduler.enqueue(thread);
        S.push(PrimitiveNil.allocate());
        heap.free_object(waitGroup_string);
        struct.free();
    }
    else if (name === "WaitGroupDone") {
        const struct = auto_cast(heap, S.pop()) as UserStruct;
        const waitGroup_string = ComplexString.allocate(heap, "INTERNAL.waitGroup");
        const waitGroup = struct.get_frame().get_variable_address(waitGroup_string).get_value() as ComplexWaitGroup;
        waitGroup.add(-1, scheduler);
        scheduler.enqueue(thread);
        S.push(PrimitiveNil.allocate());
        heap.free_object(waitGroup_string);
        struct.free();
    }
    else if (name === "WaitGroupWait") {
        const struct = auto_cast(heap, S.pop()) as UserStruct;
        const waitGroup_string = ComplexString.allocate(heap, "INTERNAL.waitGroup");
        const waitGroup = struct.get_frame().get_variable_address(waitGroup_string).get_value() as ComplexWaitGroup;
        waitGroup.wait(thread, scheduler);
        S.push(PrimitiveNil.allocate());
        heap.free_object(waitGroup_string);
        struct.free();
    }
    else {
        throw new Error("evaluate_builtin: Builtin not found");
    }
}

function get_builtin_type(name: string, args: Type[]): Type {
    if (name === "MutexLock") {
        if (args.length !== 0) {
            throw new Error("Mutex.Lock(): Unexpected arguments");
        }
        return new NilType();
    }
    else if (name === "MutexUnlock") {
        if (args.length !== 0) {
            throw new Error("Mutex.Unlock(): Unexpected arguments");
        }
        return new NilType();
    }
    else if (name === "WaitGroupAdd") {
        if (args.length !== 1) {
            throw new Error("WaitGroup.Add(): Expected 1 argument");
        }
        if (!(args[0] instanceof Int32Type)) {
            throw new Error("WaitGroup.Add(): Expected int32 argument");
        }
        return new NilType();
    }
    else if (name === "WaitGroupDone") {
        if (args.length !== 0) {
            throw new Error("WaitGroup.Done(): Unexpected arguments");
        }
        return new NilType();
    }
    else if (name === "WaitGroupWait") {
        if (args.length !== 0) {
            throw new Error("WaitGroup.Wait(): Unexpected arguments");
        }
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
    if (name === "" || name === "WaitGroup") {
        imports.push({ type: "struct", name: "STRUCT.sync.WaitGroup", value: {
            tag: "struct-type",
            name: "sync.WaitGroup",
            members: [
                { name: "INTERNAL.waitGroup", type: { tag: "wait-group-type" } },
            ],
            functions: [
                { name: "Add", value: { tag: "builtin", name: "sync.WaitGroupAdd" } },
                { name: "Done", value: { tag: "builtin", name: "sync.WaitGroupDone" } },
                { name: "Wait", value: { tag: "builtin", name: "sync.WaitGroupWait" } },
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
