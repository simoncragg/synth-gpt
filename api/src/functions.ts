import { Func } from "./clients/openaiApiClient";

export const functions = [{
	name: "perform_web_search",
	description: "Perform a web search given a search term",
	parameters: {
		type: "object",
		properties: {
			"search_term": {
				type: "string",
				description: "The search term",
			},
		},
		required: ["search_term"],
	},
}] as Func[];