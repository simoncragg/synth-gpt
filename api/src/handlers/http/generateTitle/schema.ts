export default {
	$schema: "http://json-schema.org/draft-04/schema#",
	type: "object",
	properties: {
		message: { type: "string" }
	},
	required: ["message"]
} as const;
