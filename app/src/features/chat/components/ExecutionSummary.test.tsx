import { render } from "@testing-library/react";
import ExecutionSummary from "./ExecutionSummary";

describe("ExecutionSummary", () => {

  it("renders the result when result is provided", () => {
	const successSummary = {
		success: true,
		result: "Test Result",
	  };

    const { getByTestId } = render(<ExecutionSummary summary={successSummary} />);

    const codeElement = getByTestId("executionSummary");
    expect(codeElement).toBeInTheDocument();
    expect(codeElement).toHaveTextContent("Test Result");
  });

  it("renders the error message when error is provided", () => {
    const errorSummary = {
      success: false,
      error: "Test Error",
    };
    
    const { getByTestId } = render(<ExecutionSummary summary={errorSummary} />);
    const codeElement = getByTestId("executionSummary");
    expect(codeElement).toHaveTextContent("Test Error");
  });

  it("applies success styles when success is true", () => {
	const successSummary = {
		success: true,
		result: "Test Result",
	  };
    const { getByTestId } = render(<ExecutionSummary summary={successSummary} />);
    const codeElement = getByTestId("executionSummary");
    expect(codeElement).toHaveStyle("border-left: solid 4px #00FF00B3");
  });

  it("applies error styles when success is false", () => {
    const errorSummary = {
      success: false,
      error: "Test Error",
    };
    
    const { getByTestId } = render(<ExecutionSummary summary={errorSummary} />);
    const codeElement = getByTestId("executionSummary");
    expect(codeElement).toHaveStyle("border-left: solid 4px #FF0000B3");
  });

  it("displays 'No data' when neither result nor error is provided", () => {
    const emptySummary = {
      success: true,
    };
    
    const { getByTestId } = render(<ExecutionSummary summary={emptySummary} />);
    const codeElement = getByTestId("executionSummary");
    expect(codeElement).toHaveTextContent("No data");
  });
});
