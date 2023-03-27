import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { addMessage } from "../features/chat/chatSlice";

export const chatApi = createApi({
	reducerPath: "chatApi",
	baseQuery: fetchBaseQuery({
		baseUrl: process.env.REACT_APP_CHAT_API_BASE_URL,
	}),
	endpoints: (build) => ({
		sendMessage: build.mutation<SendMessageResponse, SendMessageRequest>({
			query(request) {
				const { chatId, message } = request;
				return {
					url: `chat/${chatId}`,
					method: "POST",
					body: { message },
				};
			},
			async onQueryStarted(
				request: SendMessageRequest,
				{ dispatch, queryFulfilled }
			) {
				const userMessage = {
					sender: "user" as const,
					message: request.message,
				};
				dispatch(addMessage(userMessage));

				const { data: response } = await queryFulfilled;
				const botMessage = {
					sender: "bot" as const,
					message: response.message,
				};
				dispatch(addMessage(botMessage));
			},
		}),
		textToSpeech: build.mutation<TextToSpeechResponse, TextToSpeechRequest>({
			query(request) {
				const { transcript } = request;
				return {
					url: "textToSpeech",
					method: "POST",
					body: { transcript },
				};
			},
		}),
	}),
});

export const { useSendMessageMutation, useTextToSpeechMutation } = chatApi;
