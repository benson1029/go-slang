import { run } from './go/index.ts';

onmessage = async (e) => {
    const { code, heapSize } = e.data;
    const startTime = new Date().getTime();
    const output = await run(code, heapSize);
    postMessage({
        output: output,
        time: new Date().getTime() - startTime,
    });
};
