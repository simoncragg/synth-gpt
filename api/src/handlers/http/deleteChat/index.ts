import { handlerPath } from "@libs/handler-resolver";

export default {
	handler: `${handlerPath(__dirname)}/handler.main`,
	events: [
		{
			http: {
				method: "delete",
				path: "api/v1/chats/{chatId}",
				private: true,
			},
		},
	],
};
