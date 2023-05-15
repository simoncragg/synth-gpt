import fetch, { Response } from "node-fetch";
import { AbortSignal } from "node-fetch/externals";

const data = {
	model: "gpt-3.5-turbo",
	temperature: 1,
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

	try {
		await processResponse(response, onDeltaReceived, abortController);
	}
	catch (error) {
		if (error.name !== "AbortError") {
			throw error;
		}
	}
}

async function processResponse(
	response: Response,
	onDeltaReceived: (string, boolean) => Promise<{ abort: boolean }>,
	abortController: AbortController): Promise<void> {

	const decoder = new TextDecoder();
	for await (const chunk of response.body) {
		const decodedChunk = decoder.decode(chunk as BufferSource);
		const dataArray = mapToDataArray(decodedChunk);
		for (const jsonData of dataArray) {
			const data = JSON.parse(jsonData).choices[0] as MessageDeltaData;
			const done = data?.finish_reason !== null;
			const content = data?.delta?.content ?? null;
			if (done) {
				await onDeltaReceived("", done);
				return;
			} else if (content !== null) {
				const { abort } = await onDeltaReceived(content, done);
				if (abort) {
					abortController.abort();
					return;
				}
			}
		}
	}
}

function mapToDataArray(text: string): string[] {
	const dataArray: string[] = [];
	for (const line of text.split("\n")) {
		const dataPropertyNameIndex = line.indexOf("data:");
		if (dataPropertyNameIndex > -1) {
			const data = line.substring(dataPropertyNameIndex + 5).trim();
			if (data[0] === "{") {
				console.log({ data });
				dataArray.push(data);
			}
		}
	}
	return dataArray;
}
