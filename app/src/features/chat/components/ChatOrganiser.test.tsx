import { v4 as uuidv4 } from "uuid";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { newChatText } from "../../../constants";
import { renderWithProviders } from "../../../utils/test-utils";
import userEvent from "@testing-library/user-event";
import ChatOrganiser from "./ChatOrganiser";

describe("ChatOrganiser", () => {
	const chatId = uuidv4();

	const mockChats = [
		{ chatId: uuidv4(), title: "Chat 1" },
		{ chatId: uuidv4(), title: "Chat 2" },
		{ chatId: uuidv4(), title: "Chat 3" },
	];

	const server = setupServer();

	beforeAll(() => {
		server.listen();
		server.use(
			rest.get("*/api/v1/chats", (req, res, ctx) => {
				return res(ctx.json(mockChats));
			})
		);
	});

	afterAll(() => {
		server.close();
	});

	it("renders loading indicator while chats are being fetched", async () => {
		const { getByTestId } = renderChatOrganiser(chatId);

		await waitFor(() =>
			expect(getByTestId("chat-org-spinner")).toBeInTheDocument()
		);
	});

	it("renders the title of each chat", async () => {
		const { getByText } = renderChatOrganiser(chatId);

		await waitFor(() => {
			mockChats.forEach((chat) => {
				const chatTitle = getByText(chat.title);
				expect(chatTitle).toBeInTheDocument();
			});
		});
	});

	it("navigates to the correct URL when user clicks a chat link", async () => {
		const selectedChat = mockChats[1];
		window.history.pushState({}, "chat", "/chat");

		const { getByText } = renderChatOrganiser(chatId);
		await waitFor(() => {
			const chatLink = getByText(selectedChat.title);
			userEvent.click(chatLink);
		});

		expect(window.location.pathname).toBe(`/chat/${selectedChat.chatId}`);
	});

	it("navigates to the root path when the 'New chat' button is clicked", async () => {
		const selectedChat = mockChats[1];
		window.history.pushState({}, "chat", `/chat/${selectedChat.chatId}`);

		const { getByRole } = renderChatOrganiser(chatId);
		const newChatButton = getByRole("button", { name: /new chat/i });
		await waitFor(() => {
			userEvent.click(newChatButton);
		});

		expect(window.location.pathname).toBe("/");
	});

	const renderChatOrganiser = (chatId: string) => {
		return renderWithProviders(
			<BrowserRouter>
				<ChatOrganiser />
			</BrowserRouter>,
			{
				preloadedState: {
					chat: {
						chatId,
						title: newChatText,
						transcript: "",
						attachments: [],
						messages: [],
					},
				},
			}
		);
	};
});
