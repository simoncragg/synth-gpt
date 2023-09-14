import {
	MdDone,
	MdOutlineExpandLess,
	MdOutlineExpandMore,
} from "react-icons/md";
import { TbLoader } from "react-icons/tb";
import { useState } from "react";

import Code from "../../../components/Code";
import ExecutionSummary from "./ExecutionSummary";

interface CodingActivityProps {
	id: string;
	activity: CodingActivity;
}

const CodingActivity = ({ id, activity }: CodingActivityProps) => {
	const [isExpanded, setIsExpanded] = useState(false);

	return (
		<div className="inline-flex flex-col items-start w-full">
			<div className={`
					flex flex-start rounded-lg p-2  text-gray-800 text-sm items-center 
					${activity.currentState !== "done" ? "bg-emerald-500" : "bg-gray-300"}
			`}>
				{activity.currentState !== "done" ? (
					<>
						Working ...
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
						<span className="ml-2">Finished working</span>
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
				<div className="rounded-lg mt-2 py-3 px-4 text-sm text-gray-400 inline-block w-full">
					<Code code={activity.code} language="python" />
					{
						activity.currentState === "done" && 
					 	activity.executionSummary && 
					 	<ExecutionSummary summary={activity.executionSummary} />
					}
				</div>
			)}
		</div>
	);
};

export default CodingActivity;
