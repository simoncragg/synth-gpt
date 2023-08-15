import { render, fireEvent } from "@testing-library/react";
import Code from "./Code";

Object.assign(navigator, {
	clipboard: {
		writeText: () => null,
	},
});

describe("Code component", () => {
	it("should copy code to clipboard when 'Copy code' button is clicked", () => {
		const code = "console.log('Hello, world!')";
		const { getByText } = render(<Code code={code} language="javascript" />);
		const copyButton = getByText("Copy code");
		const clipboardSpy = jest.spyOn(navigator.clipboard, "writeText");
		clipboardSpy.mockResolvedValueOnce();

		fireEvent.click(copyButton);

		expect(clipboardSpy).toHaveBeenCalledWith(code);
		expect(getByText("Copied")).toBeInTheDocument();
	});
});
