import { expect } from "@jest/globals";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

test("example test", () => {
	const { getByText } = render(<div>Hello World</div>);
	expect(getByText("Hello World")).toBeInTheDocument();
});