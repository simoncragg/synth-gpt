import { AbortSignal } from "node-fetch/externals";
import fetch, { Response } from "node-fetch";

import { AsyncEventSourceParser, EventSourceParseCallbackAsync } from "../services/AsyncEventSourceParser";

const data = {
	model: "gpt-3.5-turbo",
	temperature: 0.0,
};

export async function generateChatResponseAsync(messages: Message[]): Promise<Message> {

	const headers = {
		"Content-Type": "application/json",
		Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
	};

	const url = `${process.env.OPENAI_API_BASE_URL}/chat/completions`;

	const response: Response = await fetch(url, {
		method: "POST",
		headers,
		body: JSON.stringify({
			...data,
			messages,
		})
	});

	const result = await response.json();

	if (result.error) {
		const { error } = result;
		console.error({ error });
		throw new Error("An error occurred consuming the chat completions api");
	}

	return result.choices[0].message;
}

export async function generateChatResponseDeltasAsync(
	messages: Message[],
	onDeltaReceived: (string, boolean) => Promise<{ abort: boolean }>
): Promise<void> {

	const headers = {
		"Content-Type": "application/json",
		Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
	};

	const url = `${process.env.OPENAI_API_BASE_URL}/chat/completions`;
	const abortController = new AbortController();
	const signal = abortController.signal as AbortSignal;

	const response: Response = await fetch(url, {
		method: "POST",
		headers,
		signal,
		body: JSON.stringify({
			...data,
			messages,
			stream: true
		}),
	});

	const onParseAsync: EventSourceParseCallbackAsync = async (event) => {
		if (event.type === "event") {
			if (event.data !== "[DONE]") {
				const content = JSON.parse(event.data).choices[0].delta?.content || "";
				const { abort } = await onDeltaReceived(content, false);
				if (abort) {
					abortController.abort();
					return;
				}
			}
			else {
				await onDeltaReceived("", true);
				return;
			}
		}
	};

	const parser = new AsyncEventSourceParser(onParseAsync);

	const decoder = new TextDecoder();
	for await (const chunk of response.body) {
		const value = decoder.decode(chunk as BufferSource);
		await parser.feedAsync(value);
	}
}
