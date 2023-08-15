import userEvent from "@testing-library/user-event";
import { render, waitFor } from "@testing-library/react";
import { v4 as uuidv4 } from "uuid";

import WebActivity from "./WebActivity";

describe("WebActivity", () => {
	const messageId = uuidv4();
	const searchTerm = "Wimbledon start date 2023";
	const results = [
		{
			id: "https://api.bing.microsoft.com/api/v7/#WebPages.0",
			name: "When is Wimbledon 2023? Dates, times and ticket ballot",
			url: "https://www.radiotimes.com/tv/sport/tennis/wimbledon-2023-date/",
			snippet:
				"Wimbledon 2023 will begin on Monday 3rd July 2023 and run until the men's singles final on Sunday 16th July 2023. As ever, the classic two-week format will return, but the tournament will...",
		},
		{
			id: "https://api.bing.microsoft.com/api/v7/#WebPages.1",
			name: "Future Dates - The Championships, Wimbledon",
			url: "https://www.wimbledon.com/en_GB/atoz/dates.html",
			snippet:
				"The Championships 2023 will take place from 3 July 2023 to 16 July 2023. The Championships 2024 will take place from 1 July 2024 to 14 July 2024",
		},
		{
			id: "https://api.bing.microsoft.com/api/v7/#WebPages.2",
			name: "Schedule - The Championships, Wimbledon - Official Site by IBM",
			url: "https://www.wimbledon.com/en_GB/atoz/schedule.html",
			snippet:
				"Championships Schedule. The Championships 2023 will be played over 14 days, this marks the second year that play on the Middle Sunday is part of the intended schedule. As last year, the fourth round singles matches will be spread across two days, and the Gentlemen's and Ladies' singles matches will be mixed through the quarter-finals.",
		},
	];

	it("renders 'Browsing the web' with a loader when the state is not 'finished'", async () => {
		const activity = {
			currentState: "searching",
			searchTerm,
			actions: [
				{
					type: "searching",
					searchTerm,
				} as SearchingWebAction,
			],
		} as WebActivity;

		const { getByText, getByTestId } = render(
			<WebActivity id={messageId} activity={activity} />
		);

		expect(getByText("Browsing the web ...")).toBeInTheDocument();
		expect(getByTestId(`loader-${messageId}`)).toBeInTheDocument();
	});

	it("renders 'Finished browsing' when the state is 'finished'", async () => {
		const activity = {
			currentState: "finished",
			searchTerm,
			actions: [],
		} as WebActivity;

		const { getByText } = render(
			<WebActivity id={messageId} activity={activity} />
		);

		expect(getByText("Finished browsing")).toBeInTheDocument();
	});

	it("renders the search action content when the state is 'searching' and content is expanded", async () => {
		const activity = {
			currentState: "searching",
			searchTerm,
			actions: [
				{
					type: "searching",
					searchTerm,
				} as SearchingWebAction,
			],
		} as WebActivity;

		const { getByText, getByRole } = render(
			<WebActivity id={messageId} activity={activity} />
		);

		const expandCollapseButton = getByRole("button");
		await waitFor(() => {
			userEvent.click(expandCollapseButton);
		});

		expect(getByText("Searching")).toBeInTheDocument();
		expect(getByText(searchTerm)).toBeInTheDocument();
	});

	it.each(["readingResults", "finished"])(
		"renders the searching and readingResults action content when the state is %p and content is expanded",
		async (currentState: string) => {
			const activity = {
				currentState,
				searchTerm,
				actions: [
					{
						type: "searching",
						searchTerm,
					} as SearchingWebAction,
					{
						type: "readingResults",
						results,
					} as ReadingWebSearchResultsAction,
				],
			} as WebActivity;

			const { getByText, getByRole, getAllByRole } = render(
				<WebActivity id={messageId} activity={activity} />
			);

			const expandCollapseButton = getByRole("button");
			await waitFor(() => {
				userEvent.click(expandCollapseButton);
			});

			expect(getByText("Searching")).toBeInTheDocument();
			expect(getByText(searchTerm)).toBeInTheDocument();

			expect(getByText("Reading search results")).toBeInTheDocument();
			const resultLinks = getAllByRole("link");
			for (let i = 0; i < resultLinks.length; i++) {
				const actions = activity.actions as ReadingWebSearchResultsAction[];
				const results = actions[1]?.results as WebSearchResult[];
				const result = results?.[i];
				if (result) {
					expect(resultLinks[i]).toHaveTextContent(result.name);
					expect(resultLinks[i]).toHaveAttribute("href", result.url);
				} else {
					throw new Error(`Result at index ${i} is null or undefined.`);
				}
			}
		}
	);
});
