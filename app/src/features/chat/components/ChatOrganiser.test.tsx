import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { v4 as uuidv4 } from "uuid";
import { vi } from "vitest";
import { waitFor } from "@testing-library/react";

import ChatOrganiser from "./ChatOrganiser";
import { addOrUpdateMessage } from "../chatSlice";
import { newChatText } from "../../../constants";
import { renderWithProviders } from "../../../utils/test-utils";

const userId = "user-123";
const accessToken = "dummy-access-token";

vi.mock("../../auth/hooks/useAuth", () => ({
	__esModule: true,
	default: () => ({ userId, accessToken }),
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
			rest.get("*/api/v1/chats", (_, res, ctx) => {
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
		const chatId = chats[0].chatId;

		server.use(
			rest.post(`*/api/v1/chats/${chatId}/generateTitle`, (_, res, ctx) => {
				const chat = chats.find((chat) => chat.chatId === chatId);
				if (chat) chat.title = title;
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

		const { getByText, store } = renderChatOrganiser(chatId, title);

		await waitFor(() => {
			store.dispatch(
				addOrUpdateMessage({
					message: {
						id: uuidv4(),
						role: "assistant",
						attachments: [],
						content: "The 16th President of the United States was Abraham Lincoln",
						timestamp: Date.now(),
					},
					isLastSegment: true,
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

	const renderChatOrganiser = (chatId: string, title: string = newChatText) => {
		return renderWithProviders(
			<BrowserRouter>
				<ChatOrganiser />
			</BrowserRouter>,
			{
				preloadedState: {
					chat: {
						chatId,
						title,
						model: "gpt-3.5-turbo" as const,
						transcript: "",
						attachments: [],
						messages: [],
					},
				},
			}
		);
	};
});
