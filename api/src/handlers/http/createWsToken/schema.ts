export default {
	$schema: "http://json-schema.org/draft-04/schema#",
	type: "object",
	properties: {
		userId: { type: "string" }
	},
	required: ["userId"]
} as const;
