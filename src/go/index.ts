import { parse, SyntaxError } from './parser/go';
import { ECE, UnsupportedCommandError } from './ece';

/**
 * Parses and executes the given code. If the code has a syntax error or the
 * execution failed, it will return a string with the error message.
 * 
 * @param code The code to parse and execute
 * @returns The result of the execution
 */
function parseAndExecute(code: string, heapSize: number, visualize: boolean): string {
    let parsed_program: object;
    try {
        parsed_program = parse(code);
    } catch (error) {
        if (error instanceof SyntaxError) {
            return `Syntax error (${error.location.start.line}:${error.location.start.column}): ${error.message}`;
        } else {
            return `Unknown error: ${error.message}`;
        }
    }
    let result;
    try {
        result = (new ECE(heapSize, parsed_program, visualize)).evaluate();
    } catch (error) {
        if (error instanceof UnsupportedCommandError) {
            return `${error.message}\n${JSON.stringify(parsed_program, null, 2)}`;
        } else {
            return `Execution error: ${error.message}\n${error.stack}`;
        }
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
export async function run(code: string, heapSize: number, visualize: boolean): Promise<string> {
    const timeoutPromise = new Promise<string>((resolve) => {
        setTimeout(() => resolve('Execution timeout'), 10000);
    });

    const executionPromise = new Promise<string>((resolve) => {
        resolve(parseAndExecute(code, heapSize, visualize));
    });

    const result = await Promise.race([executionPromise, timeoutPromise]);
    return result;
}