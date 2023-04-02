import { v4 as uuidv4 } from "uuid";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: ChatState = {
	chatId: uuidv4(),
	transcript: "",
	attachments: [],
	composedMessage: null,
	messages: [],
};

type AddMessagePayloadType = { message: ChatMessage };
type AttachCodeSnippetPayloadType = { codeSnippet: CodeSnippet };
type ComposeMessagePayloadType = { transcript: string };

const chatSlice = createSlice({
	name: "chat",
	initialState,
	reducers: {
		composeMessage: (
			chat: ChatState,
			action: PayloadAction<ComposeMessagePayloadType>
		) => {
			chat.transcript = action.payload.transcript;
			const codeAttachments = chat.attachments.filter(
				(x) => x.type === "Code"
			) as CodeAttachment[];
			const content =
				codeAttachments.length > 0
					? `${chat.transcript}\n${flatMap(codeAttachments).join("\n")}`
					: chat.transcript;

			chat.composedMessage = {
				id: uuidv4(),
				role: "user",
				content,
				timestamp: Date.now(),
			};
			chat.attachments = [];
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
		},
	},
});

export const { composeMessage, attachCodeSnippet, addMessage } =
	chatSlice.actions;

export default chatSlice;

function flatMap(codeAttachments: CodeAttachment[]) {
	return codeAttachments.flatMap(
		(attachment) =>
			`\`\`\`${attachment.content.language}\n${attachment.content.code}\n\`\`\`\n`
	);
}
