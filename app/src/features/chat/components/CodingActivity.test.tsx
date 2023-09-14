import userEvent from "@testing-library/user-event";
import { render, waitFor } from "@testing-library/react";
import { v4 as uuidv4 } from "uuid";

import CodingActivity from "./CodingActivity";

describe("CodingActivity", () => {
	const messageId = uuidv4();
	const code = "import math\nresult = math.sqrt(144)";
	const result = "12.0"

	it("renders 'Working ...' with loader when the state is 'working'", async () => {
		const activity = {
			currentState: "working",
			code,
		} as CodingActivity;

		const { getByText, getByTestId } = render(
			<CodingActivity id={messageId} activity={activity} />
		);

		expect(getByText("Working ...")).toBeInTheDocument();
		expect(getByTestId(`loader-${messageId}`)).toBeInTheDocument();
	});

	it("renders 'Finished working' when the state is 'finished'", async () => {
		const activity = {
            currentState: "done",
            code,
            executionSummary: { success: true, result },
        } as CodingActivity;

		const { getByText } = render(
			<CodingActivity id={messageId} activity={activity} />
		);

		expect(getByText("Finished working")).toBeInTheDocument();
	});

	it("renders code when the state is 'done' and content is expanded", async () => {
		const activity = {
            currentState: "done",
            code,
            executionSummary: { success: true, result },
        } as CodingActivity;

		const { getByRole, getByTestId } = render(
			<CodingActivity id={messageId} activity={activity} />
		);``

		const expandCollapseButton = getByRole("button");
		await waitFor(() => {
			userEvent.click(expandCollapseButton);
		});

		expect(getByTestId("code")).toBeInTheDocument();
	});

	it("renders result when the state is 'done' and content is expanded", async () => {
		const activity = {
            currentState: "done",
            code,
            executionSummary: { success: true, result },
        } as CodingActivity;

		const { getByText, getByRole } = render(
			<CodingActivity id={messageId} activity={activity} />
		);``

		const expandCollapseButton = getByRole("button");
		await waitFor(() => {
			userEvent.click(expandCollapseButton);
		});

		expect(getByText("12.0")).toBeInTheDocument();
	});
});
