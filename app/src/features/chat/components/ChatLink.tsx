import { useEffect, useState } from "react";
import { BsChatLeft } from "react-icons/bs";
import { FiTrash2 } from "react-icons/fi";
import { Link } from "react-router-dom";
import { MdClose, MdDone } from "react-icons/md";

interface ChatLinkProps {
	chat: Chat;
	isSelected: boolean;
	deleteChat: (chatId: string) => void;
}

type PendingStateType = "deletion" | "none";

const ChatLink = ({ chat, isSelected, deleteChat }: ChatLinkProps) => {
	const [pendingState, setPendingState] = useState<PendingStateType>("none");
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		if (!isSelected) {
			setPendingState("none");
		}
	}, [isSelected]);

	const confirm = () => {
		if (pendingState === "deletion") {
			deleteChat(chat.chatId);
			setIsDeleting(true);
		}
		setPendingState("none");
	};

	return (
		<Link
			key={chat.chatId}
			to={isSelected ? "#" : `/chat/${chat.chatId}`}
			className={`flex py-3 px-3 items-center gap-3 relative rounded-md cursor-pointer break-all${
				isSelected ? " bg-gray-700" : " hover:bg-gray-700/50"
			}`}
		>
			{!isSelected || pendingState === "none" ? (
				<BsChatLeft className="w-4 h-4" />
			) : (
				<FiTrash2 className="w-4 h-4 mb-[2px]" />
			)}
			<div className="flex-1 text-ellipsis max-h-5 overflow-hidden break-all relative">
				{isDeleting ? "Deleting ..." : chat.title}
			</div>
			{isSelected && pendingState === "deletion" && (
				<>
					<button
						type="button"
						aria-label={`Confirm ${pendingState}`}
						onClick={() => confirm()}
					>
						<MdDone className="w-4 h-4 -mr-1" />
					</button>
					<button
						type="button"
						aria-label={`Cancel ${pendingState}`}
						onClick={() => setPendingState("none")}
					>
						<MdClose className="w-4 h-4" />
					</button>
				</>
			)}
			{isSelected && pendingState === "none" && (
				<button
					type="button"
					aria-label="Delete chat"
					onClick={() => setPendingState("deletion")}
				>
					<FiTrash2 className="w-4 h-4" />
				</button>
			)}
		</Link>
	);
};

export default ChatLink;
