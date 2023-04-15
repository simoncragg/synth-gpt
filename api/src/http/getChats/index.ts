import schema from "./schema";
import { handlerPath } from "@libs/handler-resolver";

export default {
	handler: `${handlerPath(__dirname)}/handler.main`,
	events: [
		{
			http: {
				method: "get",
				path: "api/v1/chats",
				request: {
					schemas: {
						"application/json": schema,
					},
				}
			},
		},
	],
};
