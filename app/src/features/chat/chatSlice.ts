import { v4 as uuidv4 } from "uuid";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { newChatText } from "../../constants";
import { mergeMessages } from "./mergeMessages";

const initialState: ChatState = {
	chatId: uuidv4(),
	model: "gpt-3.5-turbo",
	title: newChatText,
	transcript: "",
	attachments: [],
	messages: [],
};

type SetChatModelPayloadType = { model: ChatModelType };
type SetActiveChatPayloadType = { chat: Chat };
type AddOrUpdateMessagePayloadType = { message: ChatMessage, isLastSegment: boolean };
type AttachFilePayloadType = { file: AttachedFile };
type AttachCodeSnippetPayloadType = { codeSnippet: CodeSnippet };
type RemoveAttachmentPayloadType = { attachmentId: string };

const chatSlice = createSlice({
	name: "chat",
	initialState,
	reducers: {
		setChatModel: (chat: ChatState, action: PayloadAction<SetChatModelPayloadType>) => {
			chat.model = action.payload.model;
		},

		newChat: (chat: ChatState) => {
			chat.chatId = uuidv4();
			chat.model = "gpt-3.5-turbo";
			chat.title = newChatText;
			chat.transcript = "";
			chat.attachments = [];
			chat.messages = [];
		},
		
		setActiveChat: (
			chat: ChatState,
			action: PayloadAction<SetActiveChatPayloadType>
		) => {
			const { chatId, title, model, messages } = action.payload.chat;
			chat.chatId = chatId;
			chat.model = model;
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
			const { message: newMessage, isLastSegment } = action.payload;
			const existingMessage = chat.messages.find((msg) => msg.id === newMessage.id);

			if (existingMessage) {
				const mergedMessage = mergeMessages(existingMessage, newMessage, isLastSegment);
				chat.messages = [
					...chat.messages.filter((msg) => msg.id !== existingMessage.id),
					mergedMessage,
				];
			} else  {
				chat.messages.push(newMessage);
				chat.attachments = [];
			}
		},
	},
});

export const { 
	setChatModel,
	newChat, 
	setActiveChat, 
	attachFile, 
	attachCodeSnippet, 
	addOrUpdateMessage,
	removeAttachment,
} =	chatSlice.actions;

export default chatSlice;
