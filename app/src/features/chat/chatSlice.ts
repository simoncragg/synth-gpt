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
type AddMessagePayloadType = { message: ChatMessage };
type AttachCodeSnippetPayloadType = { codeSnippet: CodeSnippet };

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

export const { newChat, setActiveChat, attachCodeSnippet, addMessage } =
	chatSlice.actions;

export default chatSlice;
