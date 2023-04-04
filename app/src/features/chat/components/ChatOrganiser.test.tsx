import { v4 as uuidv4 } from "uuid";
import { render, waitFor } from "@testing-library/react";
import { useGetChatsQuery } from "../../../services/chatApi";
import userEvent from "@testing-library/user-event";
import ChatOrganiser from "./ChatOrganiser";

jest.mock("../../../services/chatApi");

describe("ChatOrganiser", () => {
	test("displays a button to add new chat", async () => {
		useGetChatsQuery.mockReturnValue({ isLoading: false });

		const { getByRole } = render(<ChatOrganiser />);

		const addButton = getByRole("button", { name: /new chat/i });
		expect(addButton).toBeInTheDocument();

		userEvent.click(addButton);
		await waitFor(() => expect(addButton).toHaveFocus());
	});

	test("renders loading indicator while chats are being fetched", async () => {
		useGetChatsQuery.mockReturnValue({ isLoading: true });

		const { getByTestId } = render(<ChatOrganiser />);

		await waitFor(() =>
			expect(getByTestId("chat-org-spinner")).toBeInTheDocument()
		);
	});

	test("renders the title of each chat", async () => {
		const mockChats = [
			{ chatId: uuidv4(), title: "Chat 1" },
			{ chatId: uuidv4(), title: "Chat 2" },
			{ chatId: uuidv4(), title: "Chat 3" },
		];

		useGetChatsQuery.mockReturnValue({ data: mockChats, isLoading: false });

		const { getByText } = render(<ChatOrganiser />);

		await waitFor(() => {
			mockChats.forEach((chat) => {
				const chatTitle = getByText(chat.title);
				expect(chatTitle).toBeInTheDocument();
			});
		});
	});
});
