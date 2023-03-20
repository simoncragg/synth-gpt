import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

const chatId = uuidv4();

const initialState: Chat = {
	id: chatId,
	transcript: "",
	messages: [],
};

type AddMessagePayloadType = { sender: SenderType, message: string };
type UpdateTranscriptPayloadType = { transcript: string };

const chatSlice = createSlice({
	name: "chat",
	initialState,
	reducers: {
		updateTranscript: (chat: Chat, action: PayloadAction<UpdateTranscriptPayloadType>) => {
			chat.transcript = action.payload.transcript;
		},
		addMessage: (chat: Chat, action: PayloadAction<AddMessagePayloadType>) => {
			chat.messages.push({
				id: uuidv4(),
				sender: action.payload.sender,
				content: action.payload.message,
				timestamp: Date.now()
			});
		},
	},
});

export const {
	updateTranscript,
	addMessage
} = chatSlice.actions;

export default chatSlice;
