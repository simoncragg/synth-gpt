import { v4 as uuidv4 } from "uuid";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
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

	test("displays a button to add new chat", async () => {
		const { getByRole } = renderChatOrganiser(chatId);

		const addButton = getByRole("button", { name: /new chat/i });
		expect(addButton).toBeInTheDocument();

		userEvent.click(addButton);
		await waitFor(() => expect(addButton).toHaveFocus());
	});

	test("renders loading indicator while chats are being fetched", async () => {
		const { getByTestId } = renderChatOrganiser(chatId);

		await waitFor(() =>
			expect(getByTestId("chat-org-spinner")).toBeInTheDocument()
		);
	});

	test("renders the title of each chat", async () => {
		const { getByText } = renderChatOrganiser(chatId);

		await waitFor(() => {
			mockChats.forEach((chat) => {
				const chatTitle = getByText(chat.title);
				expect(chatTitle).toBeInTheDocument();
			});
		});
	});

	test("clicking on a chat link triggers request to correct URL", async () => {
		const selectedChat = mockChats[1];

		const { getByText } = renderChatOrganiser(chatId);

		await waitFor(() => {
			const chatLink = getByText(selectedChat.title);
			userEvent.click(chatLink);
		});

		expect(window.location.pathname).toBe(`/chat/${selectedChat.chatId}`);
	});

	const renderChatOrganiser = (
		chatId: string,
		initialState?: PreloadedState<RootState>
	) => {
		return renderWithProviders(
			<BrowserRouter>
				<ChatOrganiser />
			</BrowserRouter>,
			{
				preloadedState: initialState ?? {
					chat: {
						chatId,
						title: "New chat",
						transcript: "",
						attachments: [],
						messages: [],
					},
				},
			}
		);
	};
});
