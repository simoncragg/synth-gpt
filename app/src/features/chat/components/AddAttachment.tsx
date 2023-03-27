import { useDispatch } from "react-redux";
import { useState, useRef } from "react";
import { FaCode, FaImage } from "react-icons/fa";
import { HiPlus } from "react-icons/hi";
import { ImAttachment } from "react-icons/im";
import { Modal, Button } from "flowbite-react";
import { RoundButton } from "../../../components/RoundButton";
import { attachCodeSnippet } from "../chatSlice";

const AddAttachment = () => {
	const dispatch = useDispatch();
	const [isOpen, setIsOpen] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const codeSnippetRef = useRef<HTMLTextAreaElement>(null);

	const openModal = () => {
		setIsModalOpen(true);
		setIsOpen(false);
	};

	const attach = (code: string | undefined) => {
		if (code && code.length > 0) {
			const codeSnippet = {
				language: "typescript",
				code,
			} as CodeSnippet;
			dispatch(attachCodeSnippet({ codeSnippet }));
		}
	};

	return (
		<>
			<div className="fixed right-6 bottom-6 group">
				<div
					className={`flex flex-col items-center mb-4 space-y-2 ${
						!isOpen && "hidden"
					}`}
				>
					<RoundButton ariaLabel="attach-image" onClick={() => null}>
						<span className="sr-only">Image</span>
						<FaImage className="w-6 h-6" />
					</RoundButton>
					<RoundButton ariaLabel="attach-code" onClick={openModal}>
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

			<Modal
				show={isModalOpen}
				size="7xl"
				onClose={() => setIsModalOpen(false)}
			>
				<Modal.Header>
					<span className="flex w-full gap-2">
						<ImAttachment className="mt-0.5" />
						Attach Code
					</span>
				</Modal.Header>
				<Modal.Body>
					<div style={{ height: "50vh" }}>
						<textarea
							aria-label="input-code"
							ref={codeSnippetRef}
							className="w-full h-full resize-none whitespace-pre overflow-auto bg-gray-900 text-white focus:outline-blue-900 p-4"
							style={{ fontFamily: "consolas, monospace" }}
						></textarea>
					</div>
				</Modal.Body>
				<Modal.Footer className="flex justify-end">
					<Button color="gray" onClick={() => setIsModalOpen(false)}>
						Cancel
					</Button>
					<Button
						onClick={() => {
							setIsModalOpen(false);
							if (codeSnippetRef.current) {
								attach(codeSnippetRef.current.value);
								codeSnippetRef.current.value = "";
							}
						}}
					>
						Attach
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
};

export default AddAttachment;
