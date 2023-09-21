import { mocked } from "jest-mock";
import { v4 as uuidv4 } from "uuid";

import type { CodeExecutionSummary, ExecutionResultString } from "@src/types";
import type { ProcessUserMessagePayload } from "@services/UserMessageProcessor";

import ChatRepository from "@repositories/ChatRepository";
import CodeInterpreter from "@services/CodeInterpreter";
import OpenAiClientMockUtility from "./utils/OpenAiClientMockUtility";
import PostToConnectionMockUtility from "./utils/PostToConnectionMockUtility";
import TextToSpeechService from "@services/TextToSpeechService";
import UserMessageProcessor from "@services/UserMessageProcessor";
import { arrangeTextToSpeechServiceMock } from "./utils/arrangeTextToSpeechServiceMock";
import { newChatText } from "@src/constants";

jest.mock("@repositories/ChatRepository");
jest.mock("@services/TextToSpeechService");
jest.mock("@services/CodeInterpreter");

const updateItemAsyncMock = mocked(ChatRepository.prototype.updateItemAsync);
const executeCodeMock = mocked(CodeInterpreter.prototype.executeCode);
const TextToSpeechServiceMock = mocked(TextToSpeechService);

const openAiClientMockUtility = new OpenAiClientMockUtility();
const postToConnectionMockUtility = new PostToConnectionMockUtility();

describe("UserMessageProcessor: Code Interpreter - string response", () => {
	const connectionId = uuidv4();
	const chatId = uuidv4();
	const userId = uuidv4();
	const model = "gpt-3.5-turbo";
	const title = newChatText;
	
	const preambleSegments = [
		"To calculate the square root of 144, I will use the mathematical operation of finding the square root.\n\n",
		"In this case, I will use the formula sqrt(144) to find the square root of 144.",
	];
	const preamble = preambleSegments.join("");
	
	const codeSegments = [
		"import math\\n",
		"result=math.sqrt(144)",
	];
	const code = codeSegments.join("");

	const executionSummary: CodeExecutionSummary = {
		success: true,
		result: "# Result\n12.0",
	};
	const finalAssistantResponse = "The square root of 144 is 12";

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
				content: "Calculate sqrt 144. Describe your strategy before executing it.",
				timestamp: Date.now(),
			},
		};

		openAiClientMockUtility.arrangeCodeInterpreterDeltas(code, preamble);
		openAiClientMockUtility.arrangeSingleContentDeltas(finalAssistantResponse);
		
		executeCodeMock.mockResolvedValue({
			success: true,
			result: {
				type: "string",
				value: "12.0",
			} as ExecutionResultString,
		});

		arrangeTextToSpeechServiceMock(TextToSpeechServiceMock);
		
		userMessageProcessor = new UserMessageProcessor();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("should post assistant message segments to client", async () => {
		await userMessageProcessor.process(userMessagePayload);

		postToConnectionMockUtility.expectContentToBePostedToClient(
			preambleSegments[0],
			userMessagePayload,
		);

		postToConnectionMockUtility.expectContentToBePostedToClient(
			preambleSegments[1],
			userMessagePayload,
		);

		postToConnectionMockUtility.expectActivityToBePostedToClient(
			{
				type: "codingActivity",
				value: {
					code: unescapeNewLines(codeSegments[0]),
					currentState: "working",
				},
			},
			userMessagePayload,
		);

		postToConnectionMockUtility.expectActivityToBePostedToClient(
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

		postToConnectionMockUtility.expectContentToBePostedToClient(
			finalAssistantResponse,
			userMessagePayload,
			true,
		);
	});

	it("should post audio to client", async () => {
		await userMessageProcessor.process(userMessagePayload);
		postToConnectionMockUtility.expectAudioMessageToBePostedToClient(
			finalAssistantResponse,
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
					content: preambleSegments.join(""),
					activity: {
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
					content: finalAssistantResponse,
					timestamp: expect.any(Number),
				},
			],
			createdTime: expect.any(Number),
			updatedTime: expect.any(Number),
		});
	});

	const unescapeNewLines = (escapedString: string) => {
		return escapedString.replace("\\n", "\n");
	};
});
