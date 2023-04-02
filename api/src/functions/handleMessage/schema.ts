export default {
	type: "object",
	properties: {
		"id": { type: "string" },
		"role": { type: "string" },
		"content": { type: "string" },
		"timestamp": { type: "number" }
	},
	required: ["id", "role", "content", "timestamp"]
} as const;
