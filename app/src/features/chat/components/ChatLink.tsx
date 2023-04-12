import { useEffect, useRef, useState } from "react";
import { BsChatLeft } from "react-icons/bs";
import { FiEdit3, FiTrash2 } from "react-icons/fi";
import { Link } from "react-router-dom";
import { MdClose, MdDone } from "react-icons/md";

interface ChatLinkProps {
	chat: Chat;
	isSelected: boolean;
	editChatTitle: (chatId: string, title: string) => void;
	deleteChat: (chatId: string) => void;
}

type PendingStateType = "edit" | "deletion" | "none";

const ChatLink = ({
	chat,
	isSelected,
	editChatTitle,
	deleteChat,
}: ChatLinkProps) => {
	const [pendingState, setPendingState] = useState<PendingStateType>("none");
	const [isDeleting, setIsDeleting] = useState(false);
	const titleRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (pendingState === "edit" && titleRef.current) {
			titleRef.current.value = chat.title;
		}
	}, [pendingState]);

	useEffect(() => {
		if (!isSelected) {
			setPendingState("none");
		}
	}, [isSelected]);

	const confirm = () => {
		switch (pendingState) {
			case "edit":
				if (titleRef.current) {
					editChatTitle(chat.chatId, titleRef.current.value);
				}
				break;
			case "deletion":
				deleteChat(chat.chatId);
				setIsDeleting(true);
				break;
		}
		setPendingState("none");
	};

	const cancel = () => {
		if (pendingState === "edit" && titleRef.current) {
			titleRef.current.value = chat.title;
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
				{isDeleting ? (
					"Deleting ..."
				) : pendingState === "edit" ? (
					<input
						ref={titleRef}
						type="text"
						className="bg-gray-700 p-0 border-none text-sm"
						minLength={1}
						maxLength={30}
					/>
				) : (
					titleRef?.current?.value ?? chat.title
				)}
			</div>
			{isSelected && pendingState !== "none" && (
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
						onClick={() => cancel()}
					>
						<MdClose className="w-4 h-4" />
					</button>
				</>
			)}
			{isSelected && pendingState === "none" && (
				<>
					<button
						type="button"
						aria-label="Edit chat title"
						onClick={() => setPendingState("edit")}
					>
						<FiEdit3 className="w-4 h-4" />
					</button>
					<button
						type="button"
						aria-label="Delete chat"
						onClick={() => setPendingState("deletion")}
					>
						<FiTrash2 className="w-4 h-4" />
					</button>
				</>
			)}
		</Link>
	);
};

export default ChatLink;
