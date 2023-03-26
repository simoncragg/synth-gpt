import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

const chatId = uuidv4();

const initialState: Chat = {
	id: chatId,
	transcript: "",
	attachments: [],
	composedMessage: "",
	messages: [],
};

type AddMessagePayloadType = { sender: SenderType; message: string };
type AttachCodeSnippetPayloadType = { codeSnippet: CodeSnippet };
type ComposeMessagePayloadType = { transcript: string };

const chatSlice = createSlice({
	name: "chat",
	initialState,
	reducers: {
		composeMessage: (
			chat: Chat,
			action: PayloadAction<ComposeMessagePayloadType>
		) => {
			chat.transcript = action.payload.transcript;
			const codeAttachments = chat.attachments.filter(
				(x) => x.type === "Code"
			) as CodeAttachment[];
			chat.composedMessage =
				codeAttachments.length > 0
					? `${chat.transcript}\n${flatMap(codeAttachments).join("\n")}`
					: chat.transcript;
			chat.attachments = [];
		},
		attachCodeSnippet: (
			chat: Chat,
			action: PayloadAction<AttachCodeSnippetPayloadType>
		) => {
			chat.attachments.push({
				id: uuidv4(),
				type: "Code",
				content: action.payload.codeSnippet,
			} as CodeAttachment);
		},
		addMessage: (chat: Chat, action: PayloadAction<AddMessagePayloadType>) => {
			const { sender, message } = action.payload;
			chat.messages.push({
				id: uuidv4(),
				sender,
				content: message,
				timestamp: Date.now(),
			});
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
