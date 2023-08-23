import { useState } from "react";
import { FaCode, FaFileUpload } from "react-icons/fa";
import { HiPlus } from "react-icons/hi";

import { RoundButton } from "../../../components/RoundButton";

interface AttachmentMenuProps {
	onAttachFile: () => void;
	onAttachCodeSnippet: () => void;	
}

const AttachmentsMenu = ({
	onAttachFile, 
	onAttachCodeSnippet
}: AttachmentMenuProps
) => {
	const [isOpen, setIsOpen] = useState(false);

	const attachFile = () => {
		onAttachFile();
		setIsOpen(false);
	}

	const attachCodeSnippet = () => {
		onAttachCodeSnippet();
		setIsOpen(false);
	}

	return (
		<div className="fixed right-6 bottom-6 group">
				<div
					className={`flex flex-col items-center mb-4 space-y-2 ${
						!isOpen && "hidden"
					}`}
				>
					<RoundButton ariaLabel="attach-file" onClick={attachFile}>
						<span className="sr-only">File</span>
						<FaFileUpload className="w-6 h-6" />
					</RoundButton>

					<RoundButton ariaLabel="attach-code" onClick={attachCodeSnippet}>
						<span className="sr-only">Code</span>
						<FaCode className="w-6 h-6" />
					</RoundButton>
				</div>

				<button
					type="button"
					aria-label="attachments-menu"
					className="flex items-center justify-center text-white rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-800 focus:outline-none"
					onClick={() => setIsOpen(!isOpen)}
				>
					<HiPlus
						className={`w-6 h-6 transition-transform ${isOpen && "rotate-45"}`}
					/>
					<span className="sr-only">Open attachments menu</span>
				</button>
			</div>
	);
};

export default AttachmentsMenu;
