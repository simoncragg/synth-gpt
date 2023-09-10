export type ChatModelType = "gpt-3.5-turbo" | "gpt-4";

export interface Chat {
	chatId: string;
	userId: string;
	title: string;
	model: ChatModelType;
	messages: ChatMessage[];
	createdTime: number;
	updatedTime: number;
}

export type ChatWithoutMessages = Omit<Chat, "messages">;

export type RoleType = "system" | "user" | "assistant" | "function";

export interface MessageSegment {
	message: ChatMessage;
	isLastSegment: boolean;
}

export interface ChatMessage {
	id: string;
	role: RoleType;
	attachments: Attachment[],
	content: Content,
	timestamp: number;
}

type AttachmentType = "File" | "CodeSnippet";

export interface Attachment {
	id: string;
	type: AttachmentType;
}

export interface FileAttachment extends Attachment {
	file: AttachedFile;
}

export interface CodeAttachment extends Attachment {
	content: CodeSnippet;
}

export interface AttachedFile {
	name: string;
	contentType: string;
	contents: string;
	extension: string;
	size: number;
}

export interface CodeSnippet {
	language: string;
	code: string;
}

export type ContentType = "text" | "webActivity" | "codingActivity" | "functionResult";

export interface Content {
	type: ContentType;
	value: string | CodingActivity | WebActivity | FunctionResult;
}

//

type CodingStateType = "working" | "done";

export interface CodingActivity {
	code: string;
	executionSummary?: CodeExecutionSummary;
	currentState: CodingStateType;
}

export interface CodeExecutionSummary {
	success: boolean;
	result?: string;
	error?: string;
}

export interface CodeExecutionResponse {
	success: boolean;
	result?: BaseExecutionResult;
	error?: ExecutionError; 
}

export interface BaseExecutionResult {
	type: "string";
}

export interface ExecutionResultString extends BaseExecutionResult {
	value: string;
}

export interface ExecutionError {
	errorMessage: string;
	errorType: string;
	stackTrace: string[];
}

//

export type WebBrowsingStateType = "searching" | "readingResults" | "finished";

export interface WebActivity {
	searchTerm: string;
	currentState: WebBrowsingStateType;
	actions: BaseWebBrowsingAction[];
}

export interface BaseWebBrowsingAction {
	type: WebBrowsingStateType;
}

export interface SearchingWebAction extends BaseWebBrowsingAction {
	type: "searching";
	searchTerm: string;
}

export interface ReadingWebSearchResultsAction extends BaseWebBrowsingAction {
	type: "readingResults";
	results: WebSearchResult[];
}

export interface WebSearchResult {
	name: string;
	url: string;
	isFamilyFriendly: boolean;
	snippet: string;
}

export interface FunctionResult {
	name: string;
	result: string;
}

export interface WebSocketToken {
	tokenId: string;
	userId: string;
	connectionId?: string;
	createdTime: number;
	expiryTime: number;
	claimedTime?: number;
	timeToLive: number;
}

export type WebSocketMessageType = "assistantMessageSegment" | "assistantAudioSegment";

export interface WebSocketMessage {
	type: WebSocketMessageType;
	payload: BaseWebSocketMessagePayload;
}

export interface BaseWebSocketMessagePayload {
	chatId: string;
}

