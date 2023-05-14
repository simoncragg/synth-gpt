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

