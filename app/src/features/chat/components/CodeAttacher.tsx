import { useDispatch } from "react-redux";
import { useRef } from "react";
import { ImAttachment } from "react-icons/im";
import { Modal, Button } from "flowbite-react";

import { attachCodeSnippet } from "../chatSlice";

interface CodeAttacherProps {
	onClose: () => void;
}

// TODO: Set focus!
const CodeAttacher = ({ onClose }: CodeAttacherProps) => {
	const dispatch = useDispatch();
	const codeSnippetRef = useRef<HTMLTextAreaElement>(null);

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
		<Modal
			show={true}
			size="7xl"
			onClose={onClose}
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
				<Button color="gray" onClick={onClose}>
					Cancel
				</Button>
				<Button
					onClick={() => {
						onClose();
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
	);
};

export default CodeAttacher;
