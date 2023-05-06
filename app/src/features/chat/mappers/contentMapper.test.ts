import { mapToContentParts } from "./contentMapper";

const mockedId = "mockedId";

jest.mock("uuid", () => ({
	v4: () => mockedId,
}));

describe("mapToContentParts", () => {
	it("should map a simple paragraph", () => {
		const content = "Hello! How can I assist you?";

		const result = mapToContentParts(content);

		expect(result).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					type: "Paragraph",
					text: "Hello! How can I assist you?",
				}),
			])
		);
	});

	it("should map 2 simple paragraphs", () => {
		const content =
			"This is the first paragraph.\nThis is the second paragraph.";

		const result = mapToContentParts(content);

		expect(result).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					type: "Paragraph",
					text: "This is the first paragraph.",
				}),
				expect.objectContaining({
					type: "Paragraph",
					text: "This is the second paragraph.",
				}),
			])
		);
	});

	it.each(["\n", " "])(
		"should map a paragraph followed by an ordered list (separated by %p)",
		(separator: string) => {
			const content = [
				"Sure, here are three numbered points:",
				"1. List item one. First sentence.",
				"2. List item two. Second sentence.",
				"3. List item three. Third sentence.",
			].join(separator);

			const result = mapToContentParts(content);

			expect(result).toEqual([
				expect.objectContaining({
					type: "Paragraph",
					text: "Sure, here are three numbered points:",
				}),
				expect.objectContaining({
					type: "OrderedList",
					listItems: [
						expect.objectContaining({
							id: mockedId,
							text: "1. List item one. First sentence.",
						}),
						expect.objectContaining({
							id: mockedId,
							text: "2. List item two. Second sentence.",
						}),
						expect.objectContaining({
							id: mockedId,
							text: "3. List item three. Third sentence.",
						}),
					],
				}),
			]);
		}
	);

	it.each(["\n", " "])(
		"should map a paragraph, an ordered list, and another paragraph (separated by %p)",
		(separator: string) => {
			const content = [
				"Sure, here are three numbered points:",
				"1. List item one. First sentence.",
				"2. List item two. Second sentence.",
				"3. List item three. Third sentence.\nLet me know if there's anything else I can help with",
			]
				.join(separator)
				.trim();

			const result = mapToContentParts(content);

			expect(result).toEqual([
				expect.objectContaining({
					type: "Paragraph",
					text: "Sure, here are three numbered points:",
				}),
				expect.objectContaining({
					type: "OrderedList",
					listItems: [
						expect.objectContaining({
							id: mockedId,
							text: "1. List item one. First sentence.",
						}),
						expect.objectContaining({
							id: mockedId,
							text: "2. List item two. Second sentence.",
						}),
						expect.objectContaining({
							id: mockedId,
							text: "3. List item three. Third sentence.",
						}),
					],
				}),
				expect.objectContaining({
					type: "Paragraph",
					text: "Let me know if there's anything else I can help with",
				}),
			]);
		}
	);

	it.each(["\n", " "])(
		"should map a code snippet (separated by %p)",
		(separator: string) => {
			const content = ["```typescript", "print('Hello, world!')", "```"].join(
				separator
			);

			const result = mapToContentParts(content);

			expect(result).toEqual([
				expect.objectContaining({
					type: "CodeSnippet",
					language: "typescript",
					code: "print('Hello, world!')\n",
				}),
			]);
		}
	);

	it.each(["\n", " "])(
		"should map a paragraph followed by a code snippet (separated by %p)",
		(separator: string) => {
			const content = [
				"Sure, here is the jsx code:",
				"```jsx",
				"<HelloWorld />",
				"```",
			].join(separator);

			const result = mapToContentParts(content);

			expect(result).toEqual([
				expect.objectContaining({
					type: "Paragraph",
					text: "Sure, here is the jsx code:",
				}),
				expect.objectContaining({
					type: "CodeSnippet",
					language: "jsx",
					code: "<HelloWorld />\n",
				}),
			]);
		}
	);

	it.each(["\n", " "])(
		"should map a paragraph, code snippet, and another paragraph (separated by %p)",
		(separator: string) => {
			const content = [
				"Sure, here is the javascript code:",
				"```javascript",
				"print('Hello, world!')",
				"```",
				"Final Paragraph.",
			].join(separator);

			const result = mapToContentParts(content);

			expect(result).toEqual([
				expect.objectContaining({
					type: "Paragraph",
					text: "Sure, here is the javascript code:",
				}),
				expect.objectContaining({
					type: "CodeSnippet",
					language: "javascript",
					code: "print('Hello, world!')\n",
				}),
				expect.objectContaining({
					type: "Paragraph",
					text: "Final Paragraph.",
				}),
			]);
		}
	);

	it.each(["\n", " "])(
		"should map multiple paragraphs and code snippets (separated by %p)",
		(separator: string) => {
			const content = [
				"Sure, here is the javascript code:",
				"```javascript",
				"print('Line one');\nprint('Line two');",
				"```",
				"Here is the typescript code:",
				"```typescript",
				"print('Line A');\nprint('Line B');",
				"```",
				"Final paragraph.",
			].join(separator);

			const result = mapToContentParts(content);

			expect(result).toEqual([
				expect.objectContaining({
					type: "Paragraph",
					text: "Sure, here is the javascript code:",
				}),
				expect.objectContaining({
					type: "CodeSnippet",
					language: "javascript",
					code: "print('Line one');\nprint('Line two');\n",
				}),
				expect.objectContaining({
					type: "Paragraph",
					text: "Here is the typescript code:",
				}),
				expect.objectContaining({
					type: "CodeSnippet",
					language: "typescript",
					code: "print('Line A');\nprint('Line B');\n",
				}),
				expect.objectContaining({
					type: "Paragraph",
					text: "Final paragraph.",
				}),
			]);
		}
	);

	it.each(["\n", " "])(
		"should clean up erroneous code markers (separated by %p)",
		(separator: string) => {
			const content = [
				"Sure! Here is a poem about Spring:",
				"```language",
				"The sun warms the earth\nGreen buds burst forth in rebirth",
				"```",
			].join(separator);

			const result = mapToContentParts(content);

			expect(result).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						type: "Paragraph",
						text: "Sure! Here is a poem about Spring:",
					}),
					expect.objectContaining({
						type: "Paragraph",
						text: "The sun warms the earth",
					}),
					expect.objectContaining({
						type: "Paragraph",
						text: "Green buds burst forth in rebirth",
					}),
				])
			);
		}
	);
});
