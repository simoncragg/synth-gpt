import { v4 as uuidv4 } from "uuid";

import type { 
	AssistantMessageSegmentPayload
} from "./types";

import type {
	BaseExecutionResult, 
	Chat,
	ChatMessage,
	CodeExecutionResponse,
	CodeExecutionSummary,
	CodingActivity,
	ExecutionError,
	ExecutionResultString,
} from "../types";

import AssistantMessageProcessor from "./AssistantMessageProcessor";
import CodeInterpreter from "./CodeInterpreter";
import { postToConnectionAsync } from "@clients/apiGatewayManagementApiClient";

class CodingActivityProcessor {

	private readonly connectionId: string;
	private readonly chat: Chat;
	private readonly codeInterpreter: CodeInterpreter;

	constructor(connectionId: string, chat: Chat) {
		this.connectionId = connectionId;
		this.chat = chat;
		this.codeInterpreter = new CodeInterpreter();
	}

	public async process(assistantMessage: ChatMessage): Promise<void> {

		await this.postToConnection(assistantMessage);
		const { code } = assistantMessage.content.value as CodingActivity;
		const executionResponse = await this.codeInterpreter.executeCode(code);
		await this.processExecutionResponse(executionResponse, assistantMessage);
		await new AssistantMessageProcessor(this.connectionId, this.chat).process();
	}

	private async processExecutionResponse(executionResponse: CodeExecutionResponse, assistantMessage: ChatMessage) {

		const executionSummary = this.mapToExecutionSummary(executionResponse);
		const { code } = assistantMessage.content.value as CodingActivity;

		const codingActivity = {
			code,
			executionSummary,
			currentState: "done",
		} as CodingActivity;

		this.chat.messages.push({
			id: uuidv4(),
			role: "function" as const,
			attachments: [],
			content: {
				type: "functionResult" as const,
				value: {
					name: "execute_python_code",
					result: this.mapToFunctionResult(codingActivity)
				},
			},
			timestamp: Date.now(),
		});

		const updatedAssistantMessage = {
			...assistantMessage,
			content: {
				type: "codingActivity",
				value: codingActivity,
			},
		} as ChatMessage;

		this.chat.messages.push(updatedAssistantMessage);
		await this.postToConnection(updatedAssistantMessage);
	}

	//
	// TODO: extract all these mapppers into new mapper classes
	//
	
	private mapToExecutionSummary(executionResponse: CodeExecutionResponse): CodeExecutionSummary {
		const { success, result, error } = executionResponse;
		return (success) 
			? this.mapToSuccessSummary(result)
			: this.mapToErrorSummary(error);
	}

	private mapToSuccessSummary(result: BaseExecutionResult): CodeExecutionSummary {
		return {
			success: true,
			result: `# Result\n${(result as ExecutionResultString).value}`,
		};
	}

	private mapToErrorSummary(error: ExecutionError): CodeExecutionSummary {
		return {
			success: false,
			error: this.formatError(error),
		};
	}

	private formatError(error: ExecutionError): string {
		const { errorMessage, errorType, stackTrace} = error;
		let output = "Traceback (most recent call last):\n";
		if (stackTrace?.length > 0) {
			output += stackTrace.filter(st => 
				!st.includes("/var/task/lambda_function.py")
			).join("\n");
		}
		return `${output}\n${errorType}: ${errorMessage}\n`;
	}

	private mapToFunctionResult(codingActivity: CodingActivity): string {
		return codingActivity.executionSummary.success
			? codingActivity.executionSummary.result
			: codingActivity.executionSummary.error;
	}

	private async postToConnection(message: ChatMessage, isLastSegment: boolean = false) {
		await postToConnectionAsync(this.connectionId, {
			type: "assistantMessageSegment",
			payload: {
				chatId: this.chat.chatId,
				message,
				isLastSegment
			} as AssistantMessageSegmentPayload
		});
	}
}

export default CodingActivityProcessor;
