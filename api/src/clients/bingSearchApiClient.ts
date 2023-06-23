import fetch from "node-fetch";

export async function performWebSearchAsync(searchQuery: string): Promise<WebSearchResponse> {
	const endpoint = process.env.BING_SEARCH_API_ENDPOINT;
	const url = [
		`${endpoint}?q=${encodeURIComponent(searchQuery)}`,
		"&count=3",
		"&responseFilter=webPages",
		"&adultIntent=false",
		"&safeSearch=Strict",
		"&isFamilyFriendly=true"
	].join("");
	const apiKey = process.env.BING_SEARCH_API_KEY;
	const response = await fetch(url, {
		method: "GET",
		headers: {
			"Ocp-Apim-Subscription-Key": apiKey
		},
	});

	return await response.json();
}

export interface WebSearchResponse {
	queryContext: QueryContext;
	webPages: WebPages;
}

export interface QueryContext {
	originalQuery: string;
	alteredQuery?: string;
	alterationDisplayQuery?: string;
	alterationOverrideQuery?: string;
	adultIntent?: boolean;
}

export interface WebPages {
	webSearchUrl: string;
	totalEstimatedMatches?: number;
	value: WebPage[];
}

export interface WebPage {
	id: string;
	name: string;
	url: string;
	isFamilyFriendly: boolean;
	displayUrl: string;
	snippet: string;
	dateLastCrawled: string;
	language: string;
	isNavigational: boolean;
}
