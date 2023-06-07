export default {
	$schema: "http://json-schema.org/draft-04/schema#",
	type: "object",
	properties: {
		title: { type: "string" }
	},
	required: ["title"]
} as const;
