import { v4 as uuidv4 } from "uuid";

import ChatLog from "./ChatLog";
import { newChatText } from "../../../constants";
import { renderWithProviders } from "../../../utils/test-utils";

describe("ChatLog", () => {
	const chat = {
		chatId: uuidv4(),
		title: newChatText,
		transcript: "",
		messages: [],
		attachments: [],
	};

	it("displays simple paragraph messages", () => {
		const messages = [
			{
				id: uuidv4(),
				role: "user" as const,
				content: {
					type: "text" as const,
					value: "Hello",
				},
				timestamp: Date.now(),
			},
			{
				id: uuidv4(),
				role: "assistant" as const,
				content: {
					type: "text" as const,
					value: "Hi there!",
				},
				timestamp: Date.now() + 1000,
			},
		];

		const { getByText } = renderWithProviders(<ChatLog />, {
			preloadedState: { chat: { ...chat, messages } },
		});

		for (const msg of messages) {
			const messageEl = getByText(msg.content.value);
			expect(messageEl).toBeInTheDocument();
		}
	});

	it("displays paragraph and ordered list", () => {
		const responseOpener = "Certainly, here are three reasons:";

		const numberedPoints = [
			"1. First list item.",
			"2. Second list item.",
			"3. Third list item.",
		];

		const fullResponse = `${responseOpener}\n${numberedPoints.join("\n")}`;

		const messages = [
			{
				id: uuidv4(),
				role: "user" as const,
				content: {
					type: "text" as const,
					value: "Hello",
				},
				timestamp: Date.now(),
			},
			{
				id: uuidv4(),
				role: "assistant" as const,
				content: {
					type: "text" as const,
					value: fullResponse,
				},
				timestamp: Date.now() + 1000,
			},
		];

		const { getByText, getByTestId } = renderWithProviders(<ChatLog />, {
			preloadedState: { chat: { ...chat, messages } },
		});

		const el = getByText(responseOpener);
		expect(el).toBeInTheDocument();

		const orderedListEl = getByTestId("numberedPoints");
		expect(orderedListEl).toBeInTheDocument();

		for (const text of numberedPoints) {
			expect(orderedListEl.innerHTML.includes(text)).toBeTruthy();
		}
	});

	it("displays paragraph and code block", () => {
		const userCommand =
			"Write me some typescript code that calculates the first 10 Fibonacci numbers.";
		const responseText1 = "Sure, here's some typescript code:";
		const code =
			"function fibonacci(n: number): number {\n// more code goes here\nif (n === 0) return 0; console.log(fibonacci(i));\n}\n";
		const responseText2 =
			"This program defines a fibonacci function which recursively calculates the nth Fibonacci number. Then, it loops over the first 10 numbers and prints each one to the console";

		const messages = [
			{
				id: uuidv4(),
				role: "user" as const,
				timestamp: Date.now(),
				content: {
					type: "text" as const,
					value: userCommand,
				},
			},
			{
				id: uuidv4(),
				role: "assistant" as const,
				timestamp: Date.now() + 1321,
				content: {
					type: "text" as const,
					value: `${responseText1}\n\n\`\`\`typescript\n${code}\`\`\`\n\n${responseText2}`,
				},
			},
		];

		const { getByText, getByTestId } = renderWithProviders(<ChatLog />, {
			preloadedState: { chat: { ...chat, messages } },
		});

		const textToFind = [userCommand, responseText1, responseText2];
		for (const text of textToFind) {
			const el = getByText(text);
			expect(el).toBeInTheDocument();
		}

		const codeEl = getByTestId("code");
		expect(codeEl).toBeInTheDocument();
		expect(codeEl.innerHTML.includes("fibonacci")).toBeTruthy();
	});

	it("renders web activity", () => {
		const userText = "When does Wimbledon start this year?";
		const searchTerm = "Wimbledown 2023 start date";

		const messages = [
			{
				id: uuidv4(),
				role: "user" as const,
				timestamp: Date.now(),
				content: {
					type: "text" as const,
					value: userText,
				},
			},
			{
				id: uuidv4(),
				role: "assistant" as const,
				timestamp: Date.now() + 1321,
				content: {
					type: "webActivity" as const,
					value: {
						currentState: "searching",
						searchTerm,
						actions: [
							{
								type: "searching" as const,
								searchTerm,
							},
						],
					},
				},
			},
		];

		const { getByText } = renderWithProviders(<ChatLog />, {
			preloadedState: { chat: { ...chat, messages } },
		});

		const textToFind = [userText, "Browsing the web ..."];
		for (const text of textToFind) {
			const el = getByText(text);
			expect(el).toBeInTheDocument();
		}
	});
});
