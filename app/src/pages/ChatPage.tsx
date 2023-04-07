import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useGetChatQuery } from "../services/chatApi";
import { setActiveChat } from "../features/chat/chatSlice";
import Navbar from "../components/Navbar";
import Chat from "../features/chat/components/Chat";

const ChatPage = () => {
	const dispatch = useDispatch();
	const chatId = useParams().chatId ?? null;

	const { data: chat, isFetching } = useGetChatQuery(chatId ?? "", {
		skip: !chatId,
		refetchOnMountOrArgChange: true,
	});

	useEffect(() => {
		if (chat) {
			dispatch(setActiveChat({ chat }));
		}
	}, [chat]);

	return (
		<>
			<Navbar />
			<div className="flex flex-col items-center mt-16 pt-4 px-8 sm:ml-64 sm:mt-2 overflow-y-auto h-[calc(100vh-10px)]">
				<div className="flex flex-col items-center text-base w-full pt-4 sm:w-3/4">
					{isFetching ? <span>Loading ...</span> : <Chat />}
				</div>
			</div>
		</>
	);
};

export default ChatPage;
