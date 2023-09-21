import { mocked } from "jest-mock";
import { v4 as uuidv4 } from "uuid";

import type { CodeExecutionSummary, ExecutionResultFile } from "@src/types";
import type { Delta } from "@clients/openaiApiClient";
import type { ProcessUserMessagePayload } from "@services/UserMessageProcessor";

import ChatRepository from "@repositories/ChatRepository";
import CodeInterpreter from "@services/CodeInterpreter";
import FileManager from "@services/FileManager";
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
jest.mock("@services/FileManager");

const timestamp = 1695153960596;
jest.useFakeTimers().setSystemTime(timestamp);

const generateChatResponseDeltasAsyncMock = mocked(
	generateChatResponseDeltasAsync
);
const updateItemAsyncMock = mocked(ChatRepository.prototype.updateItemAsync);
const executeCodeMock = mocked(CodeInterpreter.prototype.executeCode);
const TextToSpeechServiceMock = mocked(TextToSpeechService);
const writeAsyncMock = mocked(FileManager.prototype.writeAsync);

const postToConnectionAsyncMock = mocked(postToConnectionAsync);
const postToConnectionMockUtility = new PostToConnectionMockUtility(
	postToConnectionAsyncMock
);

describe("UserMessageProcessor: Code Interpreter - image response", () => {
	const connectionId = uuidv4();
	const chatId = uuidv4();
	const userId = uuidv4();
	const model = "gpt-3.5-turbo";
	const title = newChatText;
	const codeSegments = [
		"import matplotlib.pyplot as plt",
		"# code to draw a circle",
		"result = bytes_io"
	];
	const code = codeSegments.join("\\n");
	const imageUrl = `http://localhost:4569/synth-gpt-audio-dev/output-${timestamp}.png`;
	const executionSummary: CodeExecutionSummary = {
		success: true,
		result: `# Result\n${imageUrl}`,
	};
	const assistantResponseLines = [
		"Here is the circle you requested:\\n\\n",
		`![Circle](${imageUrl})`
	];

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
				content: "Draw me a circle",
				timestamp: Date.now(),
			},
		};

		arrangeGenerateChatResponseDeltasAsyncMock(code);

		executeCodeMock.mockResolvedValue({
			success: true,
			result: {
				type: "file",
				mimeType: "image/png",
				base64EncodedContent: "<base64 encoded data>",
			} as ExecutionResultFile,
		});

		writeAsyncMock.mockResolvedValue(new URL(imageUrl));

		arrangeTextToSpeechServiceMock(TextToSpeechServiceMock);

		userMessageProcessor = new UserMessageProcessor();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("should post assistant message segments to client", async () => {
		await userMessageProcessor.process(userMessagePayload);

		for (let i=0; i < codeSegments.length-1; i++) {
			postToConnectionMockUtility.expectActivityToBePostedToClient(
				{
					type: "codingActivity",
					value: {
						code: `${codeSegments[i]}\n`,
						currentState: "working",
					},
				},
				userMessagePayload,
			);
		}

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
			assistantResponseLines.join(""),
			userMessagePayload,
			true,
		);
	});

	it("should post audio to client", async () => {
		await userMessageProcessor.process(userMessagePayload);
		postToConnectionMockUtility.expectAudioMessageToBePostedToClient(
			assistantResponseLines[0],
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
					content: assistantResponseLines.join(""),
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
					null,
				);

				for (const chunk of tokenizeAndDecodeChunks(`{ "code": "${code}" }`)) {
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

		generateChatResponseDeltasAsyncMock.mockImplementationOnce(
			async (
				_,
				onDeltaReceived: (delta: Delta, finishReason?: string) => Promise<void>
			): Promise<void> => {
				for (const chunk of tokenizeAndDecodeChunks(assistantResponseLines.join(""))) {
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
		return escapedString.replaceAll("\\n", "\n");
	};
});
