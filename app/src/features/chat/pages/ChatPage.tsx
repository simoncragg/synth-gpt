/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";

import Chat from "../components/Chat";
import Navbar from "../../../components/Navbar";
import useAuth from "../../auth/hooks/useAuth";
import { newChat, setActiveChat } from "../chatSlice";
import { useLazyGetChatQuery } from "../chatApi";

const ChatPage = () => {
	const dispatch = useDispatch();
	const location = useLocation();
	const chatId = useParams().chatId;
	const { accessToken } = useAuth();

	const [getChat, { data: getChatResponse, isFetching }] =
		useLazyGetChatQuery();

	useEffect(() => {
		if (chatId && accessToken) {
			getChat({ chatId, accessToken });
		}
	}, [chatId, accessToken]);

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
					{isFetching ? <span className="pt-24">Loading ...</span> : <Chat />}
				</div>
			</div>
		</>
	);
};

export default ChatPage;
