import { parse, SyntaxError } from './parser/go';

/**
 * Parses the given code and returns the result. If the code has a syntax error, it will
 * return a string with the error message.
 * 
 * @param code The code to parse
 * @returns The result of the parsing
 */
function parseAndExecute(code: string): string {
    try {
        const result = parse(code);
        return JSON.stringify(result, null, '  ');
    } catch (error) {
        if (error instanceof SyntaxError) {
            return `Syntax error (${error.location.start.line}:${error.location.start.column}): ${error.message}`;
        } else {
            return `Unknown error: ${error.message}`;
        }
    }
}

/**
 * Runs the given code and returns the result. If the execution takes more than 10 seconds,
 * it will return "Execution timeout".
 * 
 * @param code The code to run
 * @returns The result of the execution
 */
export async function run(code: string): Promise<string> {
    const timeoutPromise = new Promise<string>((resolve) => {
        setTimeout(() => resolve('Execution timeout'), 10000);
    });

    const executionPromise = new Promise<string>((resolve) => {
        setTimeout(() => {
            resolve(parseAndExecute(code));
        }, 1000);
    });

    const result = await Promise.race([executionPromise, timeoutPromise]);
    return result;
}