import { tools } from "./tools";

export class Interpreter {
    constructor() {
        // Initialize the interpreter
    }

    async parse(input: string): Promise<string> {
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

    async evaluateExpression(expression: string, params: any[]): Promise<any> {
        if(tools.hasOwnProperty(expression)) {
            //@ts-ignore
            const tool = tools[expression] as Function;
            console.log("Tool called:", tool);
            return tool(...params);
        }
        else {
            return `Unknown expression: ${expression}`;
        }
    }
}

export class InterpreterError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InterpreterError";
    }
}
export class InterpreterWarning extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InterpreterWarning";
    }
}

async function main() {
    const interpreter = new Interpreter();
    await interpreter.parse("The response of 1+1 is {calculate(1+1)}");
    await interpreter.parse("Voici les resultats de la recherche {search('Stephen Hawking')}");
}
main().catch((error) => {
    if (error instanceof InterpreterError) {
        console.error("Interpreter Error:", error.message);
    } else if (error instanceof InterpreterWarning) {
        console.warn("Interpreter Warning:", error.message);
    } else {
        console.error("Unexpected Error:", error);
    }
});