import schema from "./schema";
import { handlerPath } from "@libs/handler-resolver";

export default {
	handler: `${handlerPath(__dirname)}/handler.main`,
	events: [
		{
			http: {
				method: "post",
				path: "api/v1/chats/{chatId}/generateTitle",
				request: {
					schemas: {
						"application/json": schema,
					},
				}
			},
		},
	],
};
