import { v4 as uuidv4 } from "uuid";
import { renderWithProviders } from "../../../utils/test-utils";
import ChatLog from "./ChatLog";

describe("ChatLog", () => {

	it("displays messages", () => {
		const messages = [
			{ id: uuidv4(), sender: "user", timestamp: Date.now(), content: "Hello" },
			{ id: uuidv4(), sender: "bot", timestamp: Date.now() + 1000, content: "Hi there!" },
		];

		const { getByText } = renderWithProviders(<ChatLog />, {
			preloadedState: {
				chat: { messages }
			}
		});

		for (const msg of messages) {
			const messageEl = getByText(msg.content);
			expect(messageEl).toBeInTheDocument();
		}
	});
});