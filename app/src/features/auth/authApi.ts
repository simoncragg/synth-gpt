import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
	reducerPath: "authApi",
	baseQuery: fetchBaseQuery({
		baseUrl: import.meta.env.VITE_CHAT_API_BASE_URL,
		prepareHeaders: (headers) => {
			headers.set("x-api-key", import.meta.env.VITE_CHAT_API_KEY as string);
			return headers;
		},
	}),
	endpoints: (build) => ({
		createWsToken: build.mutation<CreateWsTokenResponse, CreateWsTokenRequest>({
			query(request) {
				const { userId, accessToken } = request;
				return {
					url: "auth/createWsToken",
					method: "POST",
					headers: {
						authorization: `Bearer ${accessToken}`,
					},
					body: { userId },
				};
			},
		}),
	}),
});

export const { useCreateWsTokenMutation } = authApi;
