import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
	reducerPath: "authApi",
	baseQuery: fetchBaseQuery({
		baseUrl: process.env.REACT_APP_CHAT_API_BASE_URL,
	}),
	endpoints: (build) => ({
		createWsToken: build.mutation<CreateWsTokenResponse, CreateWsTokenRequest>({
			query(request) {
				const { userId, accessToken } = request;
				return {
					url: "auth/createWsToken",
					method: "POST",
					headers: {
						"content-type": "application/json",
						authorization: `Bearer ${accessToken}`,
					},
					body: { userId },
				};
			},
		}),
	}),
});

export const { useCreateWsTokenMutation } = authApi;
