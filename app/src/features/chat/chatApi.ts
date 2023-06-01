import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const chatApi = createApi({
	reducerPath: "chatApi",
	baseQuery: fetchBaseQuery({
		baseUrl: process.env.REACT_APP_CHAT_API_BASE_URL,
	}),
	endpoints: (build) => ({
		getChats: build.query<GetChatsResponse, GetChatsRequest>({
			query(request) {
				const { userId, accessToken } = request;
				return {
					url: `chats/?userId=${userId}`,
					method: "GET",
					headers: {
						"content-type": "application/json",
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
						"content-type": "application/json",
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
						"content-type": "application/json",
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
						"content-type": "application/json",
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
						"content-type": "application/json",
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
