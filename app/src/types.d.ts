/* Chat State */

interface ChatState {
	chatId: string;
	title: string;
	transcript: string;
	attachments: CodeAttachment[];
	messages: ChatMessage[];
}

/* http api models */

interface BaseResponse {
	success: boolean;
	error?: string;
}

/* GetChat */

interface GetChatResponse extends BaseResponse {
	chat: Chat;
}

/* GetChats */

interface GetChatsResponse extends BaseResponse {
	chats: Chat[];
}

/* Delete Chat */

interface DeleteChatRequest {
	chatId: string;
}

/* Edit Chat Title */

interface EditChatTitleRequest {
	chatId: string;
	title: string;
}

/* Generate Title */

interface GenerateTitleRequest {
	chatId: string;
	message: string;
}

interface GenerateTitleResponse extends BaseResponse {
	chatId: string;
	title: string;
}

/* websocket messages */

type WebSocketMessageType =
	| "userMessage"
	| "assistantMessageSegment"
	| "assistantAudioSegment";

interface WebSocketMessage {
	type: MessageType;
	payload: BasePayload;
}

interface BasePayload {
	chatId: string;
}

interface MessagePayload extends BasePayload {
	message: ChatMessage;
}

interface MessageSegmentPayload extends MessagePayload {
	isLastSegment: boolean;
}

interface AudioSegmentPayload extends BasePayload {
	audioSegment: AudioSegment;
}

interface AudioSegment {
	audioUrl: string;
	timestamp: number;
}

/* Chat */

interface Chat {
	chatId: string;
	title: string;
	userId: string;
	createdTime: number;
	updatedTime: number;
	messages: ChatMessage[];
}

type RoleType = "user" | "assistant";

interface ChatMessage {
	id: string;
	role: RoleType;
	content: Content;
	timestamp: number;
}

/* Content */

type ContentType = "text" | "webActivity";

interface Content {
	type: ContentType;
	value: string | WebActivity;
}

interface WebActivity {
	searchTerm: string;
	currentState: string;
	actions: BaseWebBrowsingAction[];
}

type WebBrowsingActionType = "searching" | "readingResults";

interface BaseWebBrowsingAction {
	type: WebBrowsingActionType;
}

interface SearchingWebAction extends BaseWebBrowsingAction {
	type: "searching";
	searchTerm: string;
}

interface ReadingWebSearchResultsAction extends BaseWebBrowsingAction {
	type: "readingResults";
	searchTerm: string;
	results: WebSearchResult[];
}

interface WebSearchResult {
	id: string;
	name: string;
	url: string;
	isFamilyFriendly: boolean;
	displayUrl: string;
	snippet: string;
	dateLastCrawled: string;
	language: string;
	isNavigational: boolean;
}

/* Message Parts */

type MessagePartType = "Paragraph" | "OrderedList" | "CodeSnippet";

interface MessagePart {
	type: MessagePartType;
}

interface Paragraph extends MessagePart {
	type: "Paragraph";
	text: string;
}

interface OrderedList extends MessagePart {
	type: "OrderedList";
	listItems: ListItem[];
}

interface ListItem {
	id: string;
	text: string;
}

interface CodeSnippet extends MessagePart {
	type: "CodeSnippet";
	language: string;
	code: string;
}

interface WebSearch extends MessagePart {
	type: "WebSearch";
	searchTerm: string;
}

/* Attachments */

type AttachmentType = "Code" | "Image";

interface Attachment {
	id: string;
	type: AttachmentType;
}

interface CodeAttachment extends Attachment {
	content: CodeSnippet;
}
