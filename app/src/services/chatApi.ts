import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { addMessage } from "../features/chat/chatSlice";

export const chatApi = createApi({
	reducerPath: "chatApi",
	baseQuery: fetchBaseQuery({
		baseUrl: process.env.REACT_APP_CHAT_API_BASE_URL,
	}),
	endpoints: (build) => ({
		getChats: build.query<Chat[], void>({
			query() {
				return {
					url: "chats/",
					method: "GET",
				};
			},
		}),
		getChat: build.query<Chat, string>({
			query(chatId) {
				return {
					url: `chats/${chatId}`,
					method: "GET",
				};
			},
		}),
		deleteChat: build.mutation<DeleteChatResponse, DeleteChatRequest>({
			query(request) {
				const { chatId } = request;
				return {
					url: `chats/${chatId}`,
					method: "DELETE",
					body: {},
				};
			},
		}),
		generateTitle: build.mutation<GenerateTitleResponse, GenerateTitleRequest>({
			query(request) {
				const { chatId, message } = request;
				return {
					url: `chats/${chatId}/generateTitle`,
					method: "POST",
					body: { message },
				};
			},
		}),
		sendMessage: build.mutation<SendMessageResponse, SendMessageRequest>({
			query(request) {
				const { chatId, message } = request;
				return {
					url: `chats/${chatId}`,
					method: "POST",
					body: message,
				};
			},
			async onQueryStarted(
				request: SendMessageRequest,
				{ dispatch, queryFulfilled }
			) {
				dispatch(addMessage({ message: request.message }));
				const { data: response } = await queryFulfilled;
				dispatch(addMessage({ message: response.message }));
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

export const {
	useGetChatsQuery,
	useGetChatQuery,
	useGenerateTitleMutation,
	useDeleteChatMutation,
	useSendMessageMutation,
	useTextToSpeechMutation,
} = chatApi;
