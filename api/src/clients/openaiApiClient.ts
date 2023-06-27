import fetch, { Response } from "node-fetch";

import type { RoleType } from "../types";
import {
	AsyncEventSourceParser,
	EventSourceParseCallbackAsync,
} from "../services/AsyncEventSourceParser";

const data = {
	model: "gpt-3.5-turbo-0613",
	temperature: 0.0
};

export async function generateChatResponseAsync(request: ChatCompletionRequest): Promise<Message> {
	const { messages, functions } = request;
	const headers = {
		"Content-Type": "application/json",
		Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
	};
	const url = `${process.env.OPENAI_API_BASE_URL}/chat/completions`;

	const body: Body = {
		...data,
		messages,
	};

	if (functions && functions.length > 0) {
		body.functions = functions;
		body.function_call = "auto";
	}

	const response: Response = await fetch(url, {
		method: "POST",
		headers,
		body: JSON.stringify(body),
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
	request: ChatCompletionRequest,
	onDeltaReceived: (delta: Delta, finishReason: string) => Promise<void>
): Promise<void> {
	const { messages, functions } = request;
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
			functions,
			stream: true
		}),
	});

	const onParseAsync: EventSourceParseCallbackAsync = async (event) => {
		if (event.type === "event" && event.data !== "[DONE]") {
			const data = JSON.parse(event.data);
			if (data?.choices && data.choices.length > 0) {
				const choice = data.choices[0];
				const delta = choice.delta;
				if (delta) {
					await onDeltaReceived(delta, choice.finish_reason);
				}
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

interface Body {
	model: string;
	temperature: number;
	messages: Message[];
	functions?: Func[];
	stream?: boolean;
	function_call?: string;
}

export interface Delta {
	content?: string;
	function_call?: FunctionCall;
}

export interface FunctionCall {
	name?: string;
	arguments?: string;
}

export interface ChatCompletionRequest {
	messages: Message[],
	functions?: Func[],
}

export interface Message {
	role: RoleType
	name?: string;
	content: string;
}

export interface Func {
	name: string;
	description: string;
	parameters: Parameters;
}

export interface Parameters {
	type: "object",
	properties: Properties;
	required: string[];
}

export interface Properties {
	[key: string]: {
		type: string;
		description: string;
	};
}
