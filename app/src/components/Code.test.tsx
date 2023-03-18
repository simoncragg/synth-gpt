import { render, fireEvent } from "@testing-library/react";
import Code from "./Code";

Object.assign(navigator, {
	clipboard: {
		writeText: () => null,
	},
});

describe("Code component", () => {
	it("should copy code to clipboard when 'Copy code' button is clicked", async () => {

		const code = "console.log(\"Hello, world!\")";
		const language = "javascript";
		
		const { getByText } = render(<Code code={code} language={language} />);
		const copyButton = getByText("Copy code");

		const clipboardSpy = jest.spyOn(navigator.clipboard, "writeText");
		clipboardSpy.mockResolvedValueOnce();

		// Act
		fireEvent.click(copyButton);

		expect(clipboardSpy).toHaveBeenCalledWith(code);
		await expect(getByText("Copied")).toBeInTheDocument();
	});
});

