import { mocked } from "jest-mock";
import { v4 as uuidv4 } from "uuid";

import type { CodeExecutionSummary, ExecutionResultString } from "@src/types";

import type { Delta } from "@clients/openaiApiClient";

import type { ProcessUserMessagePayload } from "@services/UserMessageProcessor";

import ChatRepository from "@repositories/ChatRepository";
import CodeInterpreter from "@services/CodeInterpreter";
import PostToConnectionMockUtility from "./utils/PostToConnectionMockUtility";
import TextToSpeechService from "@services/TextToSpeechService";
import UserMessageProcessor from "@services/UserMessageProcessor";
import { arrangeTextToSpeechServiceMock } from "./utils/arrangeTextToSpeechServiceMock";
import { generateChatResponseDeltasAsync } from "@clients/openaiApiClient";
import { newChatText } from "@src/constants";
import { postToConnectionAsync } from "@clients/apiGatewayManagementApiClient";
import { tokenizeAndDecodeChunks } from "./utils/tokenizeAndDecodeChunks";

jest.mock("@clients/apiGatewayManagementApiClient");
jest.mock("@clients/openaiApiClient");
jest.mock("@repositories/ChatRepository");
jest.mock("@services/TextToSpeechService");
jest.mock("@services/CodeInterpreter");

const generateChatResponseDeltasAsyncMock = mocked(
	generateChatResponseDeltasAsync
);
const updateItemAsyncMock = mocked(ChatRepository.prototype.updateItemAsync);
const executeCodeMock = mocked(CodeInterpreter.prototype.executeCode);
const TextToSpeechServiceMock = mocked(TextToSpeechService);

const postToConnectionAsyncMock = mocked(postToConnectionAsync);
const postToConnectionMockUtility = new PostToConnectionMockUtility(
	postToConnectionAsyncMock
);

describe("UserMessageProcessor: Code Interpreter response", () => {
	const connectionId = uuidv4();
	const chatId = uuidv4();
	const userId = uuidv4();
	const model = "gpt-3.5-turbo";
	const title = newChatText;
	const codeSegments = [
		"import math\\n",
		"result=math.sqrt(144)"
	];
	const code = codeSegments.join("");
	const executionSummary: CodeExecutionSummary = {
		success: true,
		result: "# Result\n12.0",
	};
	const assistantAnswer = "The square root of 144 is 12";

	let userMessageProcessor: UserMessageProcessor;
	let userMessagePayload: ProcessUserMessagePayload;

	beforeEach(() => {
		userMessagePayload = {
			connectionId,
			chatId,
			userId,
			model,
			message: {
				id: uuidv4(),
				role: "user",
				attachments: [],
				content: {
					type: "text",
					value: "What is the square root of 144?",
				},
				timestamp: Date.now(),
			},
		};

		userMessageProcessor = new UserMessageProcessor();

		arrangeGenerateChatResponseDeltasAsyncMock(code);
		executeCodeMock.mockResolvedValue({
			success: true,
			result: {
				type: "string",
				value: "12.0",
			} as ExecutionResultString,
		});
		arrangeTextToSpeechServiceMock(TextToSpeechServiceMock);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("should post assistant message segments to client", async () => {
		await userMessageProcessor.process(userMessagePayload);

		postToConnectionMockUtility.expectAssistantMessageSegmentToBePostedToClient(
			{
				type: "codingActivity",
				value: {
					code: unescapeNewLines(codeSegments[0]),
					currentState: "working",
				},
			},
			userMessagePayload,
		);

		postToConnectionMockUtility.expectAssistantMessageSegmentToBePostedToClient(
			{
				type: "codingActivity",
				value: {
					code: unescapeNewLines(code),
					executionSummary,
					currentState: "done",
				},
			},
			userMessagePayload,
		);

		postToConnectionMockUtility.expectAssistantMessageSegmentToBePostedToClient(
			{
				type: "text",
				value: assistantAnswer,
			},
			userMessagePayload,
			true
		);
	});

	it("should post audio to client", async () => {
		await userMessageProcessor.process(userMessagePayload);
		postToConnectionMockUtility.expectAudioMessageSegmentToBePostedToClient(
			assistantAnswer,
			userMessagePayload
		);
	});

	it("should update chat database", async () => {
		await userMessageProcessor.process(userMessagePayload);

		expect(updateItemAsyncMock).toHaveBeenCalledWith({
			chatId,
			title,
			userId,
			model,
			messages: [
				{
					...userMessagePayload.message,
					timestamp: expect.any(Number),
				},
				{
					id: expect.any(String),
					role: "assistant",
					attachments: [],
					content: {
						type: "codingActivity",
						value: {
							code: unescapeNewLines(code),
							currentState: "done",
							executionSummary,
						},
					},
					timestamp: expect.any(Number),
				},
				{
					id: expect.any(String),
					role: "assistant",
					attachments: [],
					content: {
						type: "text",
						value: assistantAnswer,
					},
					timestamp: expect.any(Number),
				},
			],
			createdTime: expect.any(Number),
			updatedTime: expect.any(Number),
		});
	});

	const arrangeGenerateChatResponseDeltasAsyncMock = (code: string) => {
		generateChatResponseDeltasAsyncMock.mockImplementationOnce(
			async (
				_,
				onDeltaReceived: (delta: Delta, finishReason?: string) => Promise<void>
			): Promise<void> => {
				await onDeltaReceived(
					{
						function_call: {
							name: "execute_python_code",
							arguments: "",
						},
					},
					null
				);

				for (const chunk of tokenizeAndDecodeChunks(`{ "code": "${code}" }`)) {
					await onDeltaReceived(
						{
							function_call: {
								arguments: chunk,
							},
						},
						null
					);
				}

				await onDeltaReceived({}, "function_call");
			}
		);

		generateChatResponseDeltasAsyncMock.mockImplementationOnce(
			async (
				_,
				onDeltaReceived: (delta: Delta, finishReason?: string) => Promise<void>
			): Promise<void> => {
				for (const chunk of tokenizeAndDecodeChunks(assistantAnswer)) {
					await onDeltaReceived(
						{
							content: chunk,
						},
						null
					);
				}
				await onDeltaReceived({}, "done");
			}
		);
	};

	const unescapeNewLines = (escapedString: string) => {
		return escapedString.replace("\\n", "\n");
	};
});
