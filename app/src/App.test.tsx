import "regenerator-runtime/runtime";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import App from "./App";
import SpeechToText from "./components/SpeechToText/SpeechToText";

jest.mock("./components/SpeechToText/SpeechToText");

describe("App component", () => {
	it("should render SpeechToText component", () => {
		render(<App />);
		expect(SpeechToText).toBeCalled();
	});
});