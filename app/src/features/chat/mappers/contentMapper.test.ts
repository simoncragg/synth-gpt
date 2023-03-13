import { mapToContentParts } from "./contentMapper";

describe("mapToContentParts", () => {

	it("should map a simple paragraph", () => {
		const content = "Hello! How can I assist you?";

		const result = mapToContentParts(content);

		expect(result).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					type: "Paragraph",
					text: "Hello! How can I assist you?"
				})
			])
		);
	});

	it("should map 2 simple paragraphs", () => {
		const content = "This is the first paragraph.\nThis is the second paragraph.";

		const result = mapToContentParts(content);

		expect(result).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					type: "Paragraph",
					text: "This is the first paragraph."
				}),
				expect.objectContaining({
					type: "Paragraph",
					text: "This is the second paragraph."
				})
			])
		);
	});

	it("should map a paragraph followed by an ordered list", () => {
		const content = [
			"Sure, here are three numbered points:",
			"1. List item one. First sentence.",
			"2. List item two. Second sentence.",
			"3. List item three. Third sentence."
		].join("\n");

		const result = mapToContentParts(content);

		expect(result).toEqual(
			[
				expect.objectContaining({
					type: "Paragraph",
					text: "Sure, here are three numbered points:"
				}),
				expect.objectContaining({
					type: "OrderedList",
					items: [
						"1. List item one. First sentence.",
						"2. List item two. Second sentence.",
						"3. List item three. Third sentence."
					]
				}),
			]
		);
	});

	it("should map a paragraph followed by an ordered list, followed by another paragraph", () => {
		const content = [
			"Sure, here are three numbered points:",
			"1. List item one. First sentence.",
			"2. List item two. Second sentence.",
			"3. List item three. Third sentence.",
			"Let me know if there's anything else I can help with"
		].join("\n");

		const result = mapToContentParts(content);

		expect(result).toEqual(
			[
				expect.objectContaining({
					type: "Paragraph",
					text: "Sure, here are three numbered points:"
				}),
				expect.objectContaining({
					type: "OrderedList",
					items: [
						"1. List item one. First sentence.",
						"2. List item two. Second sentence.",
						"3. List item three. Third sentence."
					]
				}),
				expect.objectContaining({
					type: "Paragraph",
					text: "Let me know if there's anything else I can help with"
				}),
			]
		);
	});
});