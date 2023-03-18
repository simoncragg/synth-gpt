import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Navbar from "./Navbar";

describe("Navbar", () => {

	test("opens and closes sidebar when menu button is clicked", () => {
		render(<Navbar />);
		const menuButton = screen.getByRole("button", { name: "Open sidebar" });
		const sidebar = screen.getByLabelText("Sidebar");

		expect(sidebar).toHaveClass("-translate-x-full");

		fireEvent.click(menuButton);
		expect(sidebar).not.toHaveClass("-translate-x-full");

		fireEvent.click(menuButton);
		expect(sidebar).toHaveClass("-translate-x-full");
	});
});