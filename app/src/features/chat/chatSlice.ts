import { v4 as uuidv4 } from "uuid";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { newChatText } from "../../constants";

const initialState: ChatState = {
	chatId: uuidv4(),
	title: newChatText,
	transcript: "",
	attachments: [],
	messages: [],
};

type SetActiveChatPayloadType = { chat: Chat };
type AddOrUpdateMessagePayloadType = { message: ChatMessage };
type AttachFilePayloadType = { file: AttachedFile };
type AttachCodeSnippetPayloadType = { codeSnippet: CodeSnippet };
type RemoveAttachmentPayloadType = { attachmentId: string };

const chatSlice = createSlice({
	name: "chat",
	initialState,
	reducers: {
		newChat: (chat: ChatState) => {
			chat.chatId = uuidv4();
			chat.title = newChatText;
			chat.transcript = "";
			chat.attachments = [];
			chat.messages = [];
		},
		
		setActiveChat: (
			chat: ChatState,
			action: PayloadAction<SetActiveChatPayloadType>
		) => {
			const { chatId, title, messages } = action.payload.chat;
			chat.chatId = chatId;
			chat.title = title;
			chat.transcript = "";
			chat.attachments = [];
			chat.messages = messages;
		},

		attachFile: (
			chat: ChatState,
			action: PayloadAction<AttachFilePayloadType>
		) => {
			chat.attachments.push({
				id: uuidv4(),
				type: "File",
				file: action.payload.file,
			} as FileAttachment);
		},

		attachCodeSnippet: (
			chat: ChatState,
			action: PayloadAction<AttachCodeSnippetPayloadType>
		) => {
			chat.attachments.push({
				id: uuidv4(),
				type: "CodeSnippet",
				content: action.payload.codeSnippet,
			} as CodeAttachment);
		},

		removeAttachment: (
			chat: ChatState,
			action: PayloadAction<RemoveAttachmentPayloadType>
		) => {
			const { attachmentId } = action.payload;
			chat.attachments = chat.attachments.filter(a => a.id !== attachmentId);
		},

		addOrUpdateMessage: (
			chat: ChatState,
			action: PayloadAction<AddOrUpdateMessagePayloadType>
		) => {
			const { message } = action.payload;

			const matchedMessage = chat.messages.find((msg) => msg.id === message.id);
			if (matchedMessage) {
				let updatedMessage: ChatMessage;
				if (message.content.type === "text") {
					updatedMessage = {
						...matchedMessage,
						content: {
							type: "text",
							value: `${matchedMessage.content.value}${message.content.value}`,
						},
					};
				} else {
					updatedMessage = message;
				}
				chat.messages = [
					...chat.messages.filter((msg) => msg.id !== matchedMessage.id),
					updatedMessage,
				];
			} else {
				chat.messages.push(message);
				chat.attachments = [];
			}
		},
	},
});

export const { 
	newChat, 
	setActiveChat, 
	attachFile, 
	attachCodeSnippet, 
	addOrUpdateMessage,
	removeAttachment,
} =	chatSlice.actions;

export default chatSlice;
