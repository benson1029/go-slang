import { parse, SyntaxError } from './parser/go';
import { ECE } from './ece';

/**
 * Parses and executes the given code. If the code has a syntax error or the
 * execution failed, it will return a string with the error message.
 * 
 * @param code The code to parse and execute
 * @returns The result of the execution
 */
function parseAndExecute(code: string, heapSize: number, visualize: boolean): { output: string; snapshots: any[] } {
    let parsed_program: object;
    try {
        parsed_program = parse(code);
    } catch (error) {
        if (error instanceof SyntaxError) {
            return {
                output: `Syntax error (${error.location.start.line}:${error.location.start.column}): ${error.message}`,
                snapshots: []
            };
        } else {
            return {
                output: `Unknown parsing error: ${error.message}`,
                snapshots: []
            };
        }
    }
    let result;
    try {
        result = (new ECE(heapSize, parsed_program, visualize)).evaluate();
    } catch (error) {
        return {
            output: `Execution error: ${error.message}\n${error.stack}`,
            snapshots: []
        };
    }
    return result;
}

/**
 * Runs the given code and returns the result. If the execution takes more than 10 seconds,
 * it will return "Execution timeout".
 * 
 * @param code The code to run
 * @returns The result of the execution
 */
export async function run(code: string, heapSize: number, visualize: boolean): Promise<{ output: string; snapshots: any[] }> {
    const timeoutPromise = new Promise<{ output: string; snapshots: any[] }>((resolve) => {
        setTimeout(() => resolve({
            output: "Execution timeout",
            snapshots: []
        }), 10000);
    });

    const executionPromise = new Promise<{ output: string; snapshots: any[] }>((resolve) => {
        resolve(parseAndExecute(code, heapSize, visualize));
    });

    const result = await Promise.race([executionPromise, timeoutPromise]);
    return result;
}