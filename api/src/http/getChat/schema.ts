export default {
	type: "object",
	properties: {
		chatId: { type: "string" }
	},
	required: ["chatId"]
} as const;
