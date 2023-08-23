import { useState, useRef } from "react";

import AttachmentsMenu from "./AttachmentMenu";
import FileAttacher from "./FileAttacher";
import CodeAttacher from "./CodeAttacher";

const Attach = () => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isCodeAttacherOpen, setIsCodeAttacherOpen] = useState(false);

	const onAttachFile = () => {
		fileInputRef.current?.click();
	}

	const onAttachCodeSnippet = () => {
		setIsCodeAttacherOpen(true);
	};

	return (
		<>
			<AttachmentsMenu 
				onAttachFile={onAttachFile} 
				onAttachCodeSnippet={onAttachCodeSnippet}
			/>

			<FileAttacher fileInputRef={fileInputRef} />
	
			{ isCodeAttacherOpen && (
				<CodeAttacher onClose={() => setIsCodeAttacherOpen(false)} />
			)}
		</>
	);
};

export default Attach;
