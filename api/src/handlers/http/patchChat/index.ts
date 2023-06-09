import schema from "./schema";
import { handlerPath } from "@libs/handler-resolver";

export default {
	handler: `${handlerPath(__dirname)}/handler.main`,
	events: [
		{
			http: {
				method: "patch",
				path: "api/v1/chats/{chatId}",
				private: true,
				request: {
					schemas: {
						"application/json": schema,
					},
				}
			},
		},
	],
};
