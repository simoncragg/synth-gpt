import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { newChat, setActiveChat } from "../chatSlice";
import { useGetChatQuery } from "../chatApi";
import Chat from "../components/Chat";
import Navbar from "../../../components/Navbar";

const ChatPage = () => {
	const dispatch = useDispatch();
	const location = useLocation();
	const chatId = useParams().chatId ?? null;

	const { data: getChatResponse, isFetching } = useGetChatQuery(chatId ?? "", {
		skip: !chatId,
		refetchOnMountOrArgChange: true,
	});

	useEffect(() => {
		if (location.pathname === "/chat") {
			dispatch(newChat());
		}
	}, [location.pathname]);

	useEffect(() => {
		if (getChatResponse?.chat) {
			const { chat } = getChatResponse;
			dispatch(setActiveChat({ chat }));
		}
	}, [getChatResponse]);

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
