import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

const initialState: Chat = {
	messages: [{
		id: uuidv4(),
		sender: "synth",
		message: "How can I help?"
	} as ChatMessage],
};

const chatSlice = createSlice({
	name: "chat",
	initialState,
	reducers: {
		sendMessage: (chat: Chat, action: PayloadAction<string>) => {
			chat.messages.push({
				id: uuidv4(),
				sender: "user",
				message: action.payload
			});
		},
	},
});

export const { sendMessage } = chatSlice.actions;

export default chatSlice.reducer;
