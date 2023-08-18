import userEvent from "@testing-library/user-event";
import { v4 as uuidv4 } from "uuid";
import { vi } from "vitest";
import { waitFor } from "@testing-library/react";

import Navbar from "./Navbar";
import { renderWithProviders } from "../utils/test-utils";

vi.mock("react-router-dom");

describe("Navbar", () => {

	it("displays the title of the active chat on mobile", () => {
		window.innerWidth = 375;
		const title = "test title";

		const { getByText } = renderWithProviders(<Navbar />, {
			preloadedState: {
				chat: {
					chatId: uuidv4(),
					title,
					transcript: "",
					messages: [],
					attachments: [],
				},
			},
		});

		expect(getByText(title)).toBeInTheDocument();
	});

	it("opens and closes sidebar when menu button is clicked", async () => {
		const { getByRole, getByLabelText } = renderWithProviders(<Navbar />);

		const menuButton = getByRole("button", { name: "Open sidebar" });
		const sidebar = getByLabelText("Sidebar");
		expect(sidebar).toHaveClass("-translate-x-full");

		await waitFor(() => {
			userEvent.click(menuButton);
			expect(sidebar).not.toHaveClass("-translate-x-full");
		});

		await waitFor(() => {
			userEvent.click(menuButton);
			expect(sidebar).toHaveClass("-translate-x-full");
		});
	});
});
