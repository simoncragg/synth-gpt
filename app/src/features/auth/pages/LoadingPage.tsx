import { TbLoader } from "react-icons/tb";

const LoadingPage = () => {
	return (
		<div className="flex justify-center items-center h-[calc(100vh-10px)]">
			<TbLoader
				data-testid="chat-org-spinner"
				className="animate-spin text-center m-auto"
			/>
		</div>
	);
};

export default LoadingPage;
