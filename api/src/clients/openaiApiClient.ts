import type { ChatModelType, RoleType } from "../types";
import OpenAI from "openai";

const baseParams: BaseParams = {
	temperature: 0.0,
};

export async function generateChatResponseAsync(request: ChatCompletionRequest): Promise<ChatCompletionMessage> {
	const { model, messages, functions } = request;
	
	const openai = new OpenAI({
		apiKey: process.env.OPENAI_API_KEY,
	});

	const params = {
		...baseParams,
		model,
		messages,
		functions,
		stream: false,
	} as OpenAI.Chat.Completions.CompletionCreateParamsNonStreaming;

	const completion = await openai.chat.completions.create(params);
	return completion.choices[0].message;
}

export async function generateChatResponseDeltasAsync(
	request: ChatCompletionRequest,
	onDeltaReceived: (delta: Delta, finishReason: string) => Promise<void>
): Promise<void> {
	const { model, messages, functions } = request;
	
	const openai = new OpenAI({
		apiKey: process.env.OPENAI_API_KEY,
	});

	const params = {
		...baseParams,
		model,
		messages,
		functions,
		stream: true,
	} as OpenAI.Chat.Completions.CompletionCreateParamsStreaming;

	const stream = await openai.chat.completions.create(params);

	for await (const part of stream) {
		if (part?.choices && part.choices.length > 0) {
			const choice = part.choices[0];
			const delta = choice.delta as Delta;
			if (delta) {
				await onDeltaReceived(delta, choice.finish_reason);
			}
		}
	}
}

export interface ChatCompletionRequest {
	model: ChatModelType;
	messages: ChatCompletionMessage[];
	functions?: ChatCompletionFunction[];
}

export interface ChatCompletionMessage {
	role: RoleType
	name?: string;
	content: string | null;
	function_call?: {
		name: string;
		arguments: string;
	};
}

export interface ChatCompletionFunction {
	name: string;
	description: string;
	parameters: Record<string, unknown>;
}

export interface Delta {
	content?: string;
	function_call?: FunctionCall;
}

export interface FunctionCall {
	name?: string;
	arguments?: string;
}

interface BaseParams {
	temperature: number;
}
