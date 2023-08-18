import { fireEvent, render } from "@testing-library/react";
import { vi } from "vitest";
import { RoundButton } from "./RoundButton";

describe("RoundButton component", () => {
	it("should render with aria-label and children props", () => {
		const { getByLabelText, getByText } = render(
			<RoundButton ariaLabel="Test Button" onClick={() => {}}>
				Click me
			</RoundButton>
		);
		expect(getByLabelText("Test Button")).toBeInTheDocument();
		expect(getByText("Click me")).toBeInTheDocument();
	});

	it("should call onClick prop when clicked", () => {
		const handleClick = vi.fn();
		const { getByRole } = render(
			<RoundButton ariaLabel="Test Button" onClick={handleClick}>
				Click me
			</RoundButton>
		);
		const button = getByRole("button");
		fireEvent.click(button);
		expect(handleClick).toHaveBeenCalledTimes(1);
	});
});
