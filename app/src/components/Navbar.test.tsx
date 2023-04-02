import React from "react";
import { BrowserRouter } from "react-router-dom";
import { fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../utils/test-utils";
import Navbar from "./Navbar";

describe("Navbar", () => {
	test("opens and closes sidebar when menu button is clicked", () => {
		const { getByRole, getByLabelText } = renderWithProviders(
			<BrowserRouter>
				<Navbar />
			</BrowserRouter>
		);

		const menuButton = getByRole("button", { name: "Open sidebar" });
		const sidebar = getByLabelText("Sidebar");

		expect(sidebar).toHaveClass("-translate-x-full");

		fireEvent.click(menuButton);
		expect(sidebar).not.toHaveClass("-translate-x-full");

		fireEvent.click(menuButton);
		expect(sidebar).toHaveClass("-translate-x-full");
	});
});
