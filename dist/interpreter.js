"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterpreterWarning = exports.InterpreterError = exports.Interpreter = void 0;
const tools_1 = require("./tools");
class Interpreter {
    constructor() {
        // Initialize the interpreter
    }
    async parse(input) {
        // Example of code: "The response of 1+1 is {calculate("1+1")}"
        const regex = /\{([^}]+)\((.*?)\)\}/g;
        const matches = input.match(regex);
        if (matches) {
            for (const match of matches) {
                // Extract function name and parameters
                const functionRegex = /\{(\w+)\((.*?)\)\}/;
                const parts = match.match(functionRegex);
                if (parts) {
                    const expression = parts[1];
                    const params = parts[2].split(',')
                        .map(param => param.trim())
                        .filter(param => param.length > 0);
                    const result = await this.evaluateExpression(expression, params);
                    input = input.replace(match, result);
                }
            }
        }
        console.log("Final output:", input);
        return input;
    }
    async evaluateExpression(expression, params) {
        if (tools_1.tools.hasOwnProperty(expression)) {
            //@ts-ignore
            const tool = tools_1.tools[expression];
            console.log("Tool called:", tool);
            return tool(...params);
        }
        else {
            return `Unknown expression: ${expression}`;
        }
    }
}
exports.Interpreter = Interpreter;
class InterpreterError extends Error {
    constructor(message) {
        super(message);
        this.name = "InterpreterError";
    }
}
exports.InterpreterError = InterpreterError;
class InterpreterWarning extends Error {
    constructor(message) {
        super(message);
        this.name = "InterpreterWarning";
    }
}
exports.InterpreterWarning = InterpreterWarning;
async function main() {
    const interpreter = new Interpreter();
    await interpreter.parse("The response of 1+1 is {calculate(1+1)}");
    await interpreter.parse("Merci en anglais se dit {translate('Merci', 'en')}");
}
main().catch((error) => {
    if (error instanceof InterpreterError) {
        console.error("Interpreter Error:", error.message);
    }
    else if (error instanceof InterpreterWarning) {
        console.warn("Interpreter Warning:", error.message);
    }
    else {
        console.error("Unexpected Error:", error);
    }
});
