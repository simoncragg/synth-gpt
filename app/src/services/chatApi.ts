import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const chatApi = createApi({
	reducerPath: "chatApi",
	baseQuery: fetchBaseQuery({
		baseUrl: process.env.REACT_APP_CHAT_API_BASE_URL,
	}),
	endpoints: (build) => ({
		getChats: build.query<GetChatsResponse, void>({
			query() {
				return {
					url: "chats/",
					method: "GET",
				};
			},
		}),
		getChat: build.query<GetChatResponse, string>({
			query(chatId) {
				return {
					url: `chats/${chatId}`,
					method: "GET",
				};
			},
		}),
		deleteChat: build.mutation<BaseResponse, DeleteChatRequest>({
			query(request) {
				const { chatId } = request;
				return {
					url: `chats/${chatId}`,
					method: "DELETE",
					body: {},
				};
			},
		}),
		editChatTitle: build.mutation<BaseResponse, EditChatTitleRequest>({
			query(request) {
				const { chatId, title } = request;
				return {
					url: `chats/${chatId}`,
					method: "PATCH",
					body: {
						title,
					},
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
	}),
});

export const {
	useGetChatsQuery,
	useGetChatQuery,
	useGenerateTitleMutation,
	useDeleteChatMutation,
	useEditChatTitleMutation,
} = chatApi;
