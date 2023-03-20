import { mapToContentParts } from "./contentMapper";

const mockedId = "mockedId";

jest.mock("uuid", () => ({
	v4: () => mockedId
}));

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
					listItems: [
						expect.objectContaining({ id: mockedId, text: "1. List item one. First sentence." }),
						expect.objectContaining({ id: mockedId, text: "2. List item two. Second sentence." }),
						expect.objectContaining({ id: mockedId, text: "3. List item three. Third sentence." })
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
					listItems: [
						expect.objectContaining({ id: mockedId, text: "1. List item one. First sentence." }),
						expect.objectContaining({ id: mockedId, text: "2. List item two. Second sentence." }),
						expect.objectContaining({ id: mockedId, text: "3. List item three. Third sentence." })
					]
				}),
				expect.objectContaining({
					type: "Paragraph",
					text: "Let me know if there's anything else I can help with"
				}),
			]
		);
	});

	it("should map a paragraph followed by a code snippet", () => {
		const content = [
			"Sure, here is the python code:",
			"```python",
			"print(\"Hello, world!\")",
			"```"
		].join("\n");

		const result = mapToContentParts(content);

		expect(result).toEqual(
			[
				expect.objectContaining({
					type: "Paragraph",
					text: "Sure, here is the python code:"
				}),
				expect.objectContaining({
					type: "CodeSnippet",
					language: "python",
					code: "print(\"Hello, world!\")"
				}),
			]
		);
	});

	it("should map a paragraph followed by a code snippet, followed by another paragraph", () => {
		const content = [
			"Sure, here is the python code:",
			"```python",
			"print(\"Hello, world!\")",
			"```",
			"Final Paragraph."
		].join("\n");

		const result = mapToContentParts(content);

		expect(result).toEqual(
			[
				expect.objectContaining({
					type: "Paragraph",
					text: "Sure, here is the python code:"
				}),
				expect.objectContaining({
					type: "CodeSnippet",
					language: "python",
					code: "print(\"Hello, world!\")"
				}),
				expect.objectContaining({
					type: "Paragraph",
					text: "Final Paragraph."
				}),
			]
		);
	});

	it("should map multiple paragraphs and code snippets", () => {
		const content = [
			"Sure, here is the javascript code:",
			"```javascript",
			"print(\"Line one\")",
			"print(\"Line two\")",
			"```",
			"Here is the typescript code:",
			"```typescript",
			"print(\"Line A\")",
			"print(\"Line B\")",
			"```",
			"Final paragraph."
		].join("\n");

		const result = mapToContentParts(content);

		expect(result).toEqual(
			[
				expect.objectContaining({
					type: "Paragraph",
					text: "Sure, here is the javascript code:"
				}),
				expect.objectContaining({
					type: "CodeSnippet",
					language: "javascript",
					code: "print(\"Line one\")\nprint(\"Line two\")"
				}),
				expect.objectContaining({
					type: "Paragraph",
					text: "Here is the typescript code:"
				}),
				expect.objectContaining({
					type: "CodeSnippet",
					language: "typescript",
					code: "print(\"Line A\")\nprint(\"Line B\")"
				}),
				expect.objectContaining({
					type: "Paragraph",
					text: "Final paragraph."
				}),
			]
		);
	});

	it("should clean up erroneous code markers", () => {
		const content = "Sure! Here is a poem about Spring:\n```language\nThe sun warms the earth\nGreen buds burst forth in rebirth\n``` w";

		const result = mapToContentParts(content);

		expect(result).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					type: "Paragraph",
					text: "Sure! Here is a poem about Spring:"
				}),
				expect.objectContaining({
					type: "Paragraph",
					text: "The sun warms the earth"
				}),
				expect.objectContaining({
					type: "Paragraph",
					text: "Green buds burst forth in rebirth"
				})
			])
		);
	});
});
