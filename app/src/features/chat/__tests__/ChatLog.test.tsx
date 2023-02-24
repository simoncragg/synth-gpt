import { v4 as uuidv4 } from "uuid";
import { renderWithProviders } from "../../../utils/test-utils";
import ChatLog from "../ChatLog";

describe("ChatLog", () => {

	it("shows messages", () => {
		const messages = [
			{ id: uuidv4(), sender: "user", message: "Hello" },
			{ id: uuidv4(), sender: "synth", message: "Hi there!" },
		];
	
		const { container, getByText } = renderWithProviders(<ChatLog />, {
			preloadedState: {
				chat: { messages }
			}
		});

		expect(container.querySelector(".hidden")).not.toBeInTheDocument();

		for (const msg of messages) {
			const message = getByText(`${msg.sender}: ${msg.message}`);
			expect(message).toBeInTheDocument();
		}
	});

	it("is hidden when there are no messages", () => {

		const { container } = renderWithProviders(<ChatLog />, {
			preloadedState: {
				chat: { messages: [] }
			}
		});

		expect(container.querySelector(".hidden")).toBeInTheDocument();
	});
});