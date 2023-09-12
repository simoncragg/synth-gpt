import { mocked } from "jest-mock";
import { v4 as uuidv4 } from "uuid";

import type { ChatMessage } from "@src/types";
import type { Delta } from "@clients/openaiApiClient";
import type { ProcessUserMessagePayload } from "@services/UserMessageProcessor";

import ChatRepository from "@repositories/ChatRepository";
import PostToConnectionMockUtility from "./utils/PostToConnectionMockUtility";
import TextToSpeechService from "@services/TextToSpeechService";
import UserMessageProcessor from "@services/UserMessageProcessor";
import { arrangeTextToSpeechServiceMock } from "./utils/arrangeTextToSpeechServiceMock";
import { generateChatResponseDeltasAsync } from "@clients/openaiApiClient";
import { newChatText } from "@src/constants";
import { postToConnectionAsync } from "@clients/apiGatewayManagementApiClient";
import { tokenizeAndDecodeChunks } from "./utils/tokenizeAndDecodeChunks";

jest.mock("@clients/apiGatewayManagementApiClient");
jest.mock("@clients/bingSearchApiClient");
jest.mock("@clients/openaiApiClient");
jest.mock("@repositories/ChatRepository");
jest.mock("@services/TextToSpeechService");

const generateChatResponseDeltasAsyncMock = mocked(generateChatResponseDeltasAsync);
const updateItemAsyncMock = mocked(ChatRepository.prototype.updateItemAsync);
const TextToSpeechServiceMock = mocked(TextToSpeechService);

const postToConnectionAsyncMock = mocked(postToConnectionAsync);
const postToConnectionMockUtility = new PostToConnectionMockUtility(postToConnectionAsyncMock);

describe("UserMessageProcessor: Complex code block response", () => {

	const connectionId = uuidv4();
	const chatId = uuidv4();
	const userId = uuidv4();
	const model = "gpt-3.5-turbo";
	const title = newChatText;
	
	let userMessageProcessor: UserMessageProcessor;

	const generatedLines = [
		{
			line: "Sure, here's a two-line Python code to calculate the sum of even numbers from 1 to 10:\n",
			isSpoken: true,
		},
		{
			line: "```python \n",
			isSpoken: false,
		},
		{
			line: "even_sum = sum(range(2, 11, 2))\n",
			isSpoken: false,
		},
		{
			line: "print(even_sum)\n",
			isSpoken: false,
		},
		{
			line: "```\n",
			isSpoken: false,
		},
		{
			line: "Expected output:\n",
			isSpoken: true,
		},
		{
			line: "```bash 30```\n",
			isSpoken: false,
		},
		{
			line: "The provided Python code calculates and prints the sum of even numbers from 1 to 10, resulting in an expected output of 30.\n",
			isSpoken: true,
		}
	];

	let userMessage: ChatMessage;
	let userMessagePayload: ProcessUserMessagePayload;

	beforeEach(() => {
		arrangeGenerateChatResponseDeltasAsyncMock(generatedLines.map(x => x.line));
		arrangeTextToSpeechServiceMock(TextToSpeechServiceMock);

		userMessage = {
			id: uuidv4(),
			role: "user",
			attachments: [],
			content: {
				type: "text",
				value: "Calculate the sum of even numbers from 1 to 10 using 2 lines of Python and show the expected output",
			},
			timestamp: 1234567890,
		};

		userMessagePayload = {
			connectionId,
			chatId,
			userId,
			model,
			message: userMessage,
		};

		userMessageProcessor = new UserMessageProcessor();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("should post assistantMessage messages to client", async () => {
		await userMessageProcessor.process(userMessagePayload);

		for (const line of generatedLines.map(x => x.line)) {
			postToConnectionMockUtility.expectAssistantMessageSegmentToBePostedToClient(
				{
					type: "text",
					value: line,
				},
				userMessagePayload,
			);
		}
	});

	it("should post correct assistantAudio messages to client", async () => {
		await userMessageProcessor.process(userMessagePayload);

		const spokenLines = generatedLines
			.filter(x => x.isSpoken)
			.map(x => x.line);

		for (const transcript of spokenLines) {
			postToConnectionMockUtility.expectAudioMessageSegmentToBePostedToClient(transcript, userMessagePayload);
		}

		const unspokenLines = generatedLines
			.filter(x => x.isSpoken === false)
			.map(x => x.line);

		for (const transcript of unspokenLines) {
			postToConnectionMockUtility.expectAudioMessageSegmentNotToBePostedToClient(transcript, userMessagePayload);
		}
	});

	it("should update the chat database", async () => {
		await userMessageProcessor.process(userMessagePayload);

		expect(updateItemAsyncMock).toHaveBeenCalledWith(
			expect.objectContaining({
				chatId,
				title,
				userId,
				messages: [
					userMessage,
					{
						id: expect.any(String),
						role: "assistant",
						attachments: [],
						content: {
							type: "text",
							value: generatedLines.map(x => x.line).join(""),
						},
						timestamp: expect.any(Number),
					}
				],
				createdTime: expect.any(Number),
				updatedTime: expect.any(Number),
			}));
	});

	const arrangeGenerateChatResponseDeltasAsyncMock = (lines: string[]) => {
		generateChatResponseDeltasAsyncMock.mockImplementation(async (
			_,
			onDeltaReceived: (delta: Delta, finishReason?: string) => Promise<void>
		): Promise<void> => {
			for (const line of lines) {
				const chunks = tokenizeAndDecodeChunks(line);
				for (const chunk of chunks) {
					await onDeltaReceived({ content: chunk }, null);
				}
				await onDeltaReceived({}, "stop");
			}
		});
	};
});
