import { useState } from "react";
import {
	MdDone,
	MdOutlineFormatListBulleted,
	MdOutlineExpandLess,
	MdOutlineExpandMore,
	MdSearch,
} from "react-icons/md";
import { RxExternalLink } from "react-icons/rx";
import { TbLoader } from "react-icons/tb";

interface WebActivityProps {
	id: string;
	activity: WebActivity;
}

const WebActivity = ({ id, activity }: WebActivityProps) => {
	const [isExpanded, setIsExpanded] = useState(false);

	return (
		<div className="inline-flex flex-col items-start">
			<div className="flex flex-start rounded-lg p-2 bg-emerald-500 text-gray-800 text-sm items-center inline-block">
				{activity.currentState !== "finished" ? (
					<>
						Browsing the web ...
						<TbLoader
							data-testid={`loader-${id}`}
							className="animate-spin ml-2"
						/>
					</>
				) : (
					<>
						<span className="border-1 border-gray-800 rounded-full">
							<MdDone className="w-5 h-5 -mt-0.5" />
						</span>
						<span className="ml-2">Finished browsing</span>
					</>
				)}
				<button
					type="button"
					className="ml-2"
					onClick={() => setIsExpanded((curr) => !curr)}
				>
					{isExpanded ? (
						<MdOutlineExpandMore className="w-5 h-5" />
					) : (
						<MdOutlineExpandLess className="w-5 h-5" />
					)}
				</button>
			</div>

			{isExpanded && (
				<div className="rounded-lg mt-2 bg-gray-300 py-3 px-4 text-sm text-gray-800 inline-block">
					<ol className="relative">
						{activity.actions.map((action, actionIdx) => (
							<li key={`${id}-${actionIdx}`} className="mb-3 ml-6">
								{(() => {
									switch (action.type) {
										case "searching":
											return (
												<>
													<span className="absolute flex items-center justify-center w-6 h-6 -left-2 bg-gray-300">
														<MdSearch className="w-5 h-5 -mt-1" />
													</span>
													<span>
														Searching{" "}
														<strong>
															{(action as SearchingWebAction).searchTerm}
														</strong>
													</span>
												</>
											);
										case "readingResults":
											return (
												<>
													<span className="absolute flex items-center justify-center w-6 h-6 -left-2 bg-gray-300">
														<MdOutlineFormatListBulleted className="w-5 h-5 -mt-1" />
													</span>
													<span>Reading search results</span>

													<ol className="mt-2">
														{(
															action as ReadingWebSearchResultsAction
														).results.map(
															(result: WebSearchResult, index: number) => (
																<li key={`${id}-${actionIdx}-${index}`}>
																	<a
																		href={result.url}
																		target="_blank"
																		rel="noreferrer"
																		className="flex mb-1 px-2 bg-gray-100 hover:bg-sky-100/80 rounded-md justify-between"
																	>
																		<div className="flex flex-col pb-0.5">
																			<span>{result.name}</span>
																			<span className="text-xs">
																				{new URL(result.url).hostname}
																			</span>
																		</div>
																		<div className="min-w-4">
																			<RxExternalLink className="w-4 h-4 mt-1 ml-4" />
																		</div>
																	</a>
																</li>
															)
														)}
													</ol>
												</>
											);
									}
								})()}
							</li>
						))}
					</ol>
					{activity.currentState === "finished" ? (
						<ol className="relative">
							<li key={`${id}-finished`} className="ml-6">
								<span className="absolute flex items-center justify-center w-6 h-6 -left-2 bg-gray-300">
									<MdDone className="w-5 h-5 -mt-1.5" />
								</span>
								<span>Finished browsing</span>
							</li>
						</ol>
					) : (
						<TbLoader className="animate-spin -ml-1" />
					)}
				</div>
			)}
		</div>
	);
};

export default WebActivity;
