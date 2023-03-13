import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

const chatId = uuidv4();
console.log(`chatId >${chatId}<`);

const initialState: Chat = {
	id: chatId,
	messages: [],
};

type AddMessagePayloadType = { sender: SenderType, message: string };

const chatSlice = createSlice({
	name: "chat",
	initialState,
	reducers: {
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

export const { addMessage } = chatSlice.actions;

export default chatSlice;
