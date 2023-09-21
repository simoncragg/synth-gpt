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
			"Code Requirements:",
			" 1. The last line must assign the output to a result variable, e.g. 'result = 42'",
			" 2. For file outputs, assign the value of the in-memory buffer to a result variable, e.g. 'result = bytes_io'",
			" 3. There is no file system, so you must include any input data directly inside the code",
		].join("\n"),
		parameters: {
			type: "object",
			properties: {
				"code": { type: "string" },
			},
		},
	}
] as ChatCompletionFunction[];
