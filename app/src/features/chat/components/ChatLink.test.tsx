import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { vi } from "vitest";
import { waitFor } from "@testing-library/react";

import ChatLink from "./ChatLink";
import { renderWithProviders } from "../../../utils/test-utils";

describe("ChatLink", () => {
	const chat = {
		chatId: uuidv4(),
		userId: uuidv4(),
		title: "Test Chat",
		model: "gpt-3.5-turbo" as const,
		transcript: "",
		messages: [],
		attachments: [],
		createdTime: Date.now() - 1000,
		updatedTime: Date.now(),
	};

	const editChatTitleMock = vi.fn();
	const deleteChatMock = vi.fn();

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("should render chat link with chat title", () => {
		const { getByText } = renderChatLink();

		expect(getByText(chat.title)).toBeInTheDocument();
	});

	it("should add selected class to chat link when isSelected is true", () => {
		const { getByRole } = renderChatLink();

		expect(getByRole("link")).toHaveClass("bg-gray-700");
	});

	it("should show delete button when isSelected is true and not pending any confirmation", () => {
		const { getByLabelText } = renderChatLink();

		expect(getByLabelText("Edit chat title")).toBeInTheDocument();
		expect(getByLabelText("Delete chat")).toBeInTheDocument();
	});

	it("should show confirm and cancel buttons when isSelected is true and pending deletion confirmation", async () => {
		const { getByLabelText } = renderChatLink();

		const editButton = getByLabelText("Edit chat title");
		await waitFor(() => {
			userEvent.click(editButton);
		});

		expect(getByLabelText("Cancel edit")).toBeInTheDocument();
	});

	it("should show confirm and cancel buttons when the edit button is clicked", async () => {
		const { getByLabelText } = renderChatLink();

		const editButton = getByLabelText("Edit chat title");
		await waitFor(() => {
			userEvent.click(editButton);
		});

		expect(getByLabelText("Confirm edit")).toBeInTheDocument();
		expect(getByLabelText("Cancel edit")).toBeInTheDocument();
	});

	it("should bring text input of title into focus when edit button is clicked", async () => {
		const { getByLabelText, getByRole } = renderChatLink();

		const editButton = getByLabelText("Edit chat title");
		await waitFor(() => {
			userEvent.click(editButton);
		});

		const titleTextInput = getByRole("textbox");
		expect(titleTextInput).toBeInTheDocument();
		expect(document.activeElement).toBe(titleTextInput);
	});

	it("should call editChatTitle with correct args when the confirm button is clicked", async () => {
		const newTitle = "New title";

		const { getByLabelText, getByRole } = renderChatLink();

		const editButton = getByLabelText("Edit chat title");
		await waitFor(() => {
			userEvent.click(editButton);
			const inputElement = getByRole("textbox");
			userEvent.clear(inputElement);
			userEvent.type(inputElement, newTitle);
			const confirmButton = getByLabelText("Confirm edit");
			userEvent.click(confirmButton);
		});

		expect(editChatTitleMock).toHaveBeenCalledWith(chat.chatId, newTitle);
	});

	it("should not call editChatTitle when cancel button is clicked", async () => {
		const { getByLabelText } = renderChatLink();

		const editButton = getByLabelText("Edit chat title");
		await waitFor(() => {
			userEvent.click(editButton);
			const cancelButton = getByLabelText("Cancel edit");
			userEvent.click(cancelButton);
		});

		expect(editChatTitleMock).not.toHaveBeenCalled();
	});

	it("should show confirm and cancel deletion buttons when the delete button is clicked", async () => {
		const { getByLabelText } = renderChatLink();

		const deleteButton = getByLabelText("Delete chat");
		await waitFor(() => {
			userEvent.click(deleteButton);
		});

		expect(getByLabelText("Confirm deletion")).toBeInTheDocument();
		expect(getByLabelText("Cancel deletion")).toBeInTheDocument();
	});

	it("should call deleteChat when the confirm button is clicked", async () => {
		const { getByLabelText } = renderChatLink();

		const deleteButton = getByLabelText("Delete chat");
		await waitFor(() => {
			userEvent.click(deleteButton);
			const confirmButton = getByLabelText("Confirm deletion");
			userEvent.click(confirmButton);
		});

		expect(deleteChatMock).toHaveBeenCalledWith(chat.chatId);
	});

	it("should not call deleteChat when cancel button is clicked", async () => {
		const { getByLabelText } = renderChatLink();

		const deleteButton = getByLabelText("Delete chat");
		await waitFor(() => {
			userEvent.click(deleteButton);
			const cancelButton = getByLabelText("Cancel deletion");
			userEvent.click(cancelButton);
		});

		expect(deleteChatMock).not.toHaveBeenCalled();
	});

	const renderChatLink = () => {
		return renderWithProviders(
			<BrowserRouter>
				<ChatLink
					chat={chat}
					isSelected={true}
					editChatTitle={editChatTitleMock}
					deleteChat={deleteChatMock}
				/>
			</BrowserRouter>
		);
	};
});
