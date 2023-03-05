import fetch from "node-fetch";

export async function generateChatResponseAsync(userInput: string): Promise<ChatMessage> {

	const systemPrompt = "You are a helpful voice assistant. Wrap any code snippets in a <code:{language}> tag.";

	const data = {
		model: "gpt-3.5-turbo",
		messages: [
			{ role: "system", content: systemPrompt },
			{ role: "user", content: userInput },
		],
	};

	const headers = {
		"Content-Type": "application/json",
		Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
	};

	const url = `${process.env.OPENAI_API_BASE_URL}/chat/completions`;

	const response = await fetch(url, {
		method: "POST",
		headers,
		body: JSON.stringify(data)
	});

	const result = await response.json();
	return result.choices[0].message;
}
