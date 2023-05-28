import { v4 as uuidv4 } from "uuid";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { addOrUpdateMessage } from "../chatSlice";
import { newChatText } from "../../../constants";
import { renderWithProviders } from "../../../utils/test-utils";
import userEvent from "@testing-library/user-event";
import ChatOrganiser from "./ChatOrganiser";

const userId = "user-123";

jest.mock("../../auth/hooks/useAuth", () => ({
	__esModule: true,
	default: () => ({ userId }),
}));

describe("ChatOrganiser", () => {
	const mockChats = [
		{ chatId: uuidv4(), userId, title: "Chat 1" },
		{ chatId: uuidv4(), userId, title: "Chat 2" },
		{ chatId: uuidv4(), userId, title: "Chat 3" },
	];

	const server = setupServer();

	beforeAll(() => {
		server.listen();
		server.use(
			rest.get("*/api/v1/chats", (req, res, ctx) => {
				return res(
					ctx.json({
						chats: mockChats,
						success: true,
					})
				);
			})
		);
	});

	afterAll(() => {
		server.close();
	});

	it("renders loading indicator while chats are being fetched", async () => {
		const chatId = uuidv4();
		const { getByTestId } = renderChatOrganiser(chatId);
		await waitFor(() =>
			expect(getByTestId("chat-org-spinner")).toBeInTheDocument()
		);
	});

	it("renders the title of each chat", async () => {
		const chatId = uuidv4();
		const { getByText } = renderChatOrganiser(chatId);

		await waitFor(() => {
			mockChats.forEach((chat) => {
				const chatTitle = getByText(chat.title);
				expect(chatTitle).toBeInTheDocument();
			});
		});
	});

	it("auto-generates title for new chat when the assistant response is received.", async () => {
		const title = "16th US President";
		const chats = [
			{ chatId: uuidv4(), userId, title: newChatText },
			...mockChats,
		];
		const chatId = chats.find((chat) => chat.title === newChatText).chatId;

		server.use(
			rest.post(`*/api/v1/chats/${chatId}/generateTitle`, (req, res, ctx) => {
				const chat = chats.find((chat) => chat.chatId === chatId);
				chat.title = title;
				return res(
					ctx.json({
						chatId,
						title,
						success: true,
					})
				);
			}),

			rest.get("*/api/v1/chats", (req, res, ctx) => {
				return res(
					ctx.json({
						chats,
						success: true,
					})
				);
			})
		);

		const { getByText, store } = renderChatOrganiser(chatId, {
			chat: {
				chatId,
				title: "New chat",
				transcript: "",
				attachments: [],
				messages: [
					{
						id: uuidv4(),
						role: "user" as const,
						content: {
							type: "text",
							value: "Who was the 16th US president",
						},
						timestamp: Date.now(),
					},
				],
			},
		});

		await waitFor(() => {
			store.dispatch(
				addOrUpdateMessage({
					message: {
						id: uuidv4(),
						role: "assistant" as const,
						content: {
							type: "text",
							value:
								"The 16th President of the United States was Abraham Lincoln",
						},
						timestamp: Date.now(),
					},
				})
			);
		});

		await waitFor(() => {
			const chatDiv = getByText(title);
			expect(chatDiv).toBeInTheDocument();
		});
	});

	it("navigates to the correct URL when user clicks a chat link", async () => {
		const chatId = uuidv4();
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
		const chatId = uuidv4();
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
