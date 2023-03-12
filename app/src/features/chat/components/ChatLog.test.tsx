import { v4 as uuidv4 } from "uuid";
import { renderWithProviders } from "../../../utils/test-utils";
import ChatLog from "./ChatLog";

describe("ChatLog", () => {

	it("displays messages", () => {
		const messages = [
			{ id: uuidv4(), sender: "user", message: "Hello" },
			{ id: uuidv4(), sender: "synth", message: "Hi there!" },
		];
	
		const { getByText } = renderWithProviders(<ChatLog />, {
			preloadedState: {
				chat: { messages }
			}
		});

		for (const msg of messages) {
			const messageEl = getByText(msg.message);
			expect(messageEl).toBeInTheDocument();
		}
	});
});