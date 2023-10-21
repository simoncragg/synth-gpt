import { ChatCompletionFunction } from "./clients/openaiApiClient";

export const functions = [
	{
		name: "perform_web_search",
		description: "Performs a web search with the given a search term",
		parameters: {
			type: "object",
			properties: {
				"search_term": { type: "string"	},
			},
		},
	},
	{
		name: "execute_python_code",
		description: [
			"Executes the provided Python code and returns the result.", 
			"Use Cases:",
			" 1. Solving math problems",
			" 2. Creating data visualizations",
			"Usage Policy:",
			" 1. The last line must always assign the output to a variable named 'result', e.g. 'result = math.sqrt(144)'",
			" 2. For file outputs, assign the value of the in-memory buffer to the result variable, e.g. 'result = bytes_io'",
			" 3. Since there's no file system, include all input data directly in the code",
			" 4. The 'result' variable must belong to one of the following data types: str, int, float, bool, list, or ByteIO",
		].join("\n"),
		parameters: {
			type: "object",
			properties: {
				"code": { type: "string" },
			},
		},
	}
] as ChatCompletionFunction[];
