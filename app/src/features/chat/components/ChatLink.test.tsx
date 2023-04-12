import { v4 as uuidv4 } from "uuid";
import { waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { renderWithProviders } from "../../../utils/test-utils";
import userEvent from "@testing-library/user-event";
import ChatLink from "./ChatLink";

describe("ChatLink", () => {
	const chat = {
		chatId: uuidv4(),
		title: "Test Chat",
	};

	const deleteChat = jest.fn();

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("should render chat link with chat title", () => {
		const { getByText } = render(
			<ChatLink chat={chat} isSelected={false} deleteChat={deleteChat} />
		);
		expect(getByText(chat.title)).toBeInTheDocument();
	});

	it("should add selected class to chat link when isSelected is true", () => {
		const { getByRole } = render(
			<ChatLink chat={chat} isSelected={true} deleteChat={deleteChat} />
		);
		expect(getByRole("link")).toHaveClass("bg-gray-700");
	});

	it("should show delete button when isSelected is true and not pending any confirmation", () => {
		const { getByLabelText } = render(
			<ChatLink chat={chat} isSelected={true} deleteChat={deleteChat} />
		);
		expect(getByLabelText("Delete chat")).toBeInTheDocument();
	});

	it("should show confirm and cancel buttons when isSelected is true and pending deletion confirmation", async () => {
		const { getByLabelText } = render(
			<ChatLink chat={chat} isSelected={true} deleteChat={deleteChat} />
		);
		const deleteButton = getByLabelText("Delete chat");
		await waitFor(() => {
			userEvent.click(deleteButton);
		});

		expect(getByLabelText("Confirm deletion")).toBeInTheDocument();
		expect(getByLabelText("Cancel deletion")).toBeInTheDocument();
	});

	it("should call deleteChat when the confirm delete button is clicked", async () => {
		const { getByLabelText } = render(
			<ChatLink chat={chat} isSelected={true} deleteChat={deleteChat} />
		);
		const deleteButton = getByLabelText("Delete chat");
		await waitFor(() => {
			userEvent.click(deleteButton);
			const confirmButton = getByLabelText("Confirm deletion");
			userEvent.click(confirmButton);
		});

		expect(deleteChat).toHaveBeenCalledWith(chat.chatId);
	});

	it("should not call deleteChat when cancel delete button is clicked", async () => {
		const { getByLabelText } = render(
			<ChatLink chat={chat} isSelected={true} deleteChat={deleteChat} />
		);
		const deleteButton = getByLabelText("Delete chat");
		await waitFor(() => {
			userEvent.click(deleteButton);
			const cancelButton = getByLabelText("Cancel deletion");
			userEvent.click(cancelButton);
		});

		expect(deleteChat).not.toHaveBeenCalled();
	});

	const render = () => {
		return renderWithProviders(
			<BrowserRouter>
				<ChatLink chat={chat} isSelected={true} deleteChat={deleteChat} />
			</BrowserRouter>
		);
	};
});
