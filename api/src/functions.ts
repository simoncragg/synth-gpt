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
			"Use Case: Solving math problems",
			"Code Requirements: The last line must set the 'result' variable, e.g. 'result = 42'",
		].join("\n"),
		parameters: {
			type: "object",
			properties: {
				"code": { type: "string" },
			},
		},
	}
] as ChatCompletionFunction[];
