import { useEffect, useRef } from "react";

import TypingIndicator from "../../../components/TypingIndicator";
import { RootStateType } from "../../../store";
import { useSelector } from "react-redux";

const useScroll = () => {

	const { messages } = useSelector(
		(state: RootStateType) => state.chat
	);

	const scrollToTargetRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		scrollTo(scrollToTargetRef.current);
	}, [messages]);

	const scrollTo = (target: HTMLDivElement | null) => {
		target?.scrollIntoView({
			behavior: "smooth",
			block: "end",
			inline: "nearest",
		});
	};

	return {
		scrollToTargetRef
	};
};

export default useScroll;
