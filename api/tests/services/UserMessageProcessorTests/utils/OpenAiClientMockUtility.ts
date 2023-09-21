import type {
	MockedFunction
} from "jest-mock";

import { mocked } from "jest-mock";
import tiktoken from "tiktoken-node";

import type {
	ChatCompletionRequest,
	Delta
} from "@src/clients/openaiApiClient";

import {
	generateChatResponseDeltasAsync
} from "@clients/openaiApiClient";

jest.mock("@clients/openaiApiClient");

type GenerateChatResponseDeltasAsyncMock = MockedFunction<(
    request: ChatCompletionRequest, 
    onDeltaReceived: (delta: Delta, finishReason: string) => Promise<void>
) => Promise<void>>;

class OpenAiClientMockUtility {

	private generateChatResponseDeltasAsyncMock: GenerateChatResponseDeltasAsyncMock;
  
	constructor() {
		this.generateChatResponseDeltasAsyncMock = mocked(generateChatResponseDeltasAsync);
	}

	arrangeCodeInterpreterDeltas(code: string, preamble?: string) {
		
		this.generateChatResponseDeltasAsyncMock.mockImplementationOnce(
			async (
				_,
				onDeltaReceived: (delta: Delta, finishReason?: string) => Promise<void>
			): Promise<void> => {

				if (preamble) {
					for (const chunk of this.tokenizeAndDecodeChunks(preamble)) {
						await onDeltaReceived(
							{
								content: chunk,
							},
							null,
						);
					}
				}

				await onDeltaReceived(
					{
						function_call: {
							name: "execute_python_code",
							arguments: "",
						},
					},
					null,
				);

				for (const chunk of this.tokenizeAndDecodeChunks(`{ "code": "${code}" }`)) {
					await onDeltaReceived(
						{
							function_call: {
								arguments: chunk,
							},
						},
						null,
					);
				}

				await onDeltaReceived({}, "function_call");
			}
		);
	}

	arrangeWebSearchDeltas(searchTerm: string) {

		this.generateChatResponseDeltasAsyncMock.mockImplementationOnce(async (
			_,
			onDeltaReceived: (delta: Delta, finishReason?: string) => Promise<void>
		): Promise<void> => {
		
			await onDeltaReceived({
				function_call: {
					name: "perform_web_search",
					arguments: "",
				},
			}, null);
		
			for (const chunk of this.tokenizeAndDecodeChunks(`{ "search_term": "${searchTerm}" }`)) {
				await onDeltaReceived({
					function_call: {
						name: "perform_web_search",
						arguments: chunk
					},
				}, null);
			}
			await onDeltaReceived({}, "function_call");
		});
	}

	arrangeMultipleContentDeltas(contentLines: string[]) {
		this.generateChatResponseDeltasAsyncMock.mockImplementationOnce(
			async (): Promise<void> => {
				for (const content of contentLines) {
					this.arrangeSingleContentDeltas(content);
				}
			}
		);
	}

	arrangeSingleContentDeltas(content: string) {
		this.generateChatResponseDeltasAsyncMock.mockImplementationOnce(
			async (
				_,
				onDeltaReceived: (delta: Delta, finishReason?: string) => Promise<void>
			): Promise<void> => {
				for (const chunk of this.tokenizeAndDecodeChunks(content)) {
					await onDeltaReceived(
						{
							content: chunk,
						},
						null,
					);
				}

				await onDeltaReceived({}, "stop");
			}
		);
	}

	tokenizeAndDecodeChunks(str: string): string[] {
		const tokenizer = tiktoken.getEncoding("cl100k_base");
		return tokenizer.encode(str).map(token => tokenizer.decode([token]));
	}
}

export default OpenAiClientMockUtility;