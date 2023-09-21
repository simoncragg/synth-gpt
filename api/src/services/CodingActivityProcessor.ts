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
	ExecutionResultFile,
	ExecutionResultString,
} from "../types";

import AssistantMessageProcessor from "./AssistantMessageProcessor";
import CodeInterpreter from "./CodeInterpreter";
import FileManager from "./FileManager";
import { postToConnectionAsync } from "@clients/apiGatewayManagementApiClient";

class CodingActivityProcessor {

	private readonly connectionId: string;
	private readonly chat: Chat;
	private readonly codeInterpreter: CodeInterpreter;
	private readonly fileManager: FileManager;

	private fileUrl: URL | null;

	constructor(connectionId: string, chat: Chat) {
		this.connectionId = connectionId;
		this.chat = chat;
		this.codeInterpreter = new CodeInterpreter();
		this.fileManager = new FileManager(process.env.S3_FILES_BUCKET_NAME);
	}

	public async process(assistantMessage: ChatMessage): Promise<void> {
		const { code } = assistantMessage.activity.value as CodingActivity;
		const executionResponse = await this.codeInterpreter.executeCode(code);
		await this.processExecutionResponse(executionResponse, assistantMessage);
		await new AssistantMessageProcessor(this.connectionId, this.chat).process();
	}

	private async processExecutionResponse(executionResponse: CodeExecutionResponse, assistantMessage: ChatMessage) {

		const { success, result } = executionResponse;
		if (success && result.type === "file") {
			await this.createFile(result);
		}
		const executionSummary = this.mapToExecutionSummary(executionResponse);
		const { code } = assistantMessage.activity?.value as CodingActivity;

		const codingActivity = {
			code,
			executionSummary,
			currentState: "done",
		} as CodingActivity;

		const updatedAssistantMessage = {
			...assistantMessage,
			activity: {
				type: "codingActivity",
				value: codingActivity,
			},
		} as ChatMessage;

		this.chat.messages.push(updatedAssistantMessage);
		
		await this.postToConnection({
			...updatedAssistantMessage,
			content: undefined,
		});
	}

	private async createFile(result: BaseExecutionResult) {
		const { mimeType, base64EncodedContent } = result as ExecutionResultFile;
		const buffer = Buffer.from(base64EncodedContent, "base64");
		const uint8Array = new Uint8Array(buffer);
		const extension = FileManager.determineFileExtension(mimeType);
		this.fileUrl = await this.fileManager.writeAsync(`output-${Date.now()}.${extension}`, uint8Array);
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
			result: this.formatResult(result),
		};
	}

	private formatResult(result: BaseExecutionResult): string {
		return result.type === "file"
			? `# Result\n${this.fileUrl}`
			: `# Result\n${(result as ExecutionResultString).value}`;
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
