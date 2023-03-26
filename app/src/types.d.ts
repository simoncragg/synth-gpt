/* Chat */

interface Chat {
	id: string;
	transcript: string;
	attachments: CodeAttachment[];
	composedMessage: string;
	messages: ChatMessage[];
}

type SenderType = "user" | "bot";

interface ChatMessage {
	id: string;
	sender: SenderType;
	content: string;
	timestamp: number;
}

/* SendMessage */

interface SendMessageRequest {
	chatId: string;
	message: string;
}

interface SendMessageResponse {
	message: string;
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
