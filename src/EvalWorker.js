import { run } from './go/index.ts';

onmessage = async (e) => {
    const { code, heapSize, visualize } = e.data;
    const startTime = new Date().getTime();
    run(code, heapSize, visualize).then((output) => {
        postMessage({
            output: output.output,
            snapshots: output.snapshots,
            time: new Date().getTime() - startTime,
        });
    });
};
