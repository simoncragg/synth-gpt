import { v4 as uuidv4 } from "uuid";

import ChatLog from "./ChatLog";
import { newChatText } from "../../../constants";
import { renderWithProviders } from "../../../utils/test-utils";

describe("ChatLog", () => {
	const chat = {
		chatId: uuidv4(),
		model: "gpt-3.5-turbo",
		title: newChatText,
		transcript: "",
		attachments: [],
		messages: [],
		userId: uuidv4(),
		createdTime: Date.now(),
		updatedTime: Date.now(),
	} as Chat;

	it("displays simple paragraph messages", () => {
		const messages = [
			{
				id: uuidv4(),
				role: "user",
				attachments: [],
				content: "Hello",
				timestamp: Date.now(),
			},
			{
				id: uuidv4(),
				role: "assistant",
				attachments: [],
				content: "Hi there!",
				timestamp: Date.now() + 1000,
			},
		];

		const { getByText } = renderWithProviders(<ChatLog />, {
			preloadedState: { chat: { ...chat, messages } },
		});

		for (const msg of messages) {
			const messageEl = getByText(msg.content);
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
				role: "user",
				attachments: [],
				content: "Hello",
				timestamp: Date.now(),
			},
			{
				id: uuidv4(),
				role: "assistant",
				attachments: [],
				content: fullResponse,
				timestamp: Date.now() + 1000,
			},
		] as ChatMessage[];

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
				role: "user",
				attachments: [],
				content: userCommand,
				timestamp: Date.now(),
			},
			{
				id: uuidv4(),
				role: "assistant",
				attachments: [],
				content: `${responseText1}\n\n\`\`\`typescript\n${code}\`\`\`\n\n${responseText2}`,
				timestamp: Date.now() + 1321,
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
				role: "user",
				attachments: [],
				content: userText,
				timestamp: Date.now(),
			},
			{
				id: uuidv4(),
				role: "assistant",
				attachments: [],
				activity: {
					type: "webActivity",
					value: {
						currentState: "searching",
						searchTerm,
						actions: [
							{
								type: "searching",
								searchTerm,
							},
						],
					},
				},
				timestamp: Date.now() + 1321,
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
