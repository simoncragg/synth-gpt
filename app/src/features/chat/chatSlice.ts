import { v4 as uuidv4 } from "uuid";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: ChatState = {
	chatId: uuidv4(),
	title: "New chat",
	transcript: "",
	attachments: [],
	messages: [],
};

type SetActiveChatPayloadType = { chat: Chat };
type AddMessagePayloadType = { message: ChatMessage };
type AttachCodeSnippetPayloadType = { codeSnippet: CodeSnippet };

const chatSlice = createSlice({
	name: "chat",
	initialState,
	reducers: {
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

		attachCodeSnippet: (
			chat: ChatState,
			action: PayloadAction<AttachCodeSnippetPayloadType>
		) => {
			chat.attachments.push({
				id: uuidv4(),
				type: "Code",
				content: action.payload.codeSnippet,
			} as CodeAttachment);
		},

		addMessage: (
			chat: ChatState,
			action: PayloadAction<AddMessagePayloadType>
		) => {
			chat.messages.push(action.payload.message);
			chat.attachments = [];
		},
	},
});

export const { setActiveChat, attachCodeSnippet, addMessage } =
	chatSlice.actions;

export default chatSlice;
