/* Chat State */

interface ChatState {
	chatId: string;
	title: string;
	transcript: string;
	attachments: CodeAttachment[];
	messages: ChatMessage[];
}

type RoleType = "user" | "assistant";

interface ChatMessage {
	id: string;
	role: RoleType;
	content: string;
	timestamp: number;
}

/* GetChats */

interface Chat {
	chatId: string;
	title: string;
	userId: string;
	createdTime: number;
	updatedTime: number;
	messages: ChatMessage[];
}

/* GetChat */

interface GetChatResponse {
	chat: Chat;
}

/* Generate Title */

interface GenerateTitleRequest {
	chatId: string;
	message: string;
}

interface GenerateTitleResponse {
	chatId: string;
	title: string;
}

/* SendMessage */

interface SendMessageRequest {
	chatId: string;
	message: ChatMessage;
}

interface SendMessageResponse {
	message: ChatMessage;
}

/* TextToSpeech */

interface TextToSpeechRequest {
	transcript: string;
}

interface TextToSpeechResponse {
	transcript: string;
	audioUrl: string;
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

/* Attachments */

type AttachmentType = "Code" | "Image";

interface Attachment {
	id: string;
	type: AttachmentType;
}

interface CodeAttachment extends Attachment {
	content: CodeSnippet;
}
