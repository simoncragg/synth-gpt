import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const chatApi = createApi({
	reducerPath: "chatApi",
	baseQuery: fetchBaseQuery({
		baseUrl: process.env.REACT_APP_CHAT_API_BASE_URL,
		prepareHeaders: (headers) => {
			headers.set("x-api-key", process.env.REACT_APP_CHAT_API_KEY as string);
			return headers;
		},
	}),
	endpoints: (build) => ({
		getChats: build.query<GetChatsResponse, GetChatsRequest>({
			query(request) {
				const { userId, accessToken } = request;
				return {
					url: `chats/?userId=${userId}`,
					method: "GET",
					headers: {
						authorization: `Bearer ${accessToken}`,
					},
				};
			},
		}),
		getChat: build.query<GetChatResponse, GetChatRequest>({
			query(request) {
				const { chatId, accessToken } = request;
				return {
					url: `chats/${chatId}`,
					method: "GET",
					headers: {
						authorization: `Bearer ${accessToken}`,
					},
				};
			},
		}),
		editChatTitle: build.mutation<BaseResponse, EditChatTitleRequest>({
			query(request) {
				const { chatId, title, accessToken } = request;
				return {
					url: `chats/${chatId}`,
					method: "PATCH",
					body: {
						title,
					},
					headers: {
						authorization: `Bearer ${accessToken}`,
					},
				};
			},
		}),
		deleteChat: build.mutation<BaseResponse, DeleteChatRequest>({
			query(request) {
				const { chatId, accessToken } = request;
				return {
					url: `chats/${chatId}`,
					method: "DELETE",
					headers: {
						authorization: `Bearer ${accessToken}`,
					},
					body: {},
				};
			},
		}),
		generateTitle: build.mutation<GenerateTitleResponse, GenerateTitleRequest>({
			query(request) {
				const { chatId, message, accessToken } = request;
				return {
					url: `chats/${chatId}/generateTitle`,
					method: "POST",
					headers: {
						authorization: `Bearer ${accessToken}`,
					},
					body: { message },
				};
			},
		}),
	}),
});

export const {
	useLazyGetChatsQuery,
	useLazyGetChatQuery,
	useGenerateTitleMutation,
	useDeleteChatMutation,
	useEditChatTitleMutation,
} = chatApi;
