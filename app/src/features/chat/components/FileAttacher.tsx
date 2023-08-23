import { useDispatch } from "react-redux";

import { attachFile } from "../chatSlice";

interface FileAttacherProps {
	fileInputRef: React.RefObject<HTMLInputElement>;
}

const FileAttacher = ({fileInputRef}: FileAttacherProps) => {
	const dispatch = useDispatch();

	const attachFiles = (files: FileList) => {
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			readAndAttachFile(file);
		}
	};
	
	const readAndAttachFile = (file: File) => {
		const reader = new FileReader();
		reader.onload = (event) => {
			dispatch(attachFile({ 
				file: {
					name: file.name,
					contentType: file.type,
					extension: extractFileExtension(file.name),
					size: file.size,
					contents: event.target!.result as string,
				}
			}));
		};
		reader.readAsText(file);
	};

	const extractFileExtension = (filename: string) => {
		const lastDotIndex = filename.lastIndexOf(".");
		return (lastDotIndex > -1)
			? filename.substring(lastDotIndex + 1)
			: "";
	}
		
	return (
		<input
			data-testid="file-input"
			type="file"
			ref={fileInputRef} 
			className="w-0 h-0" 
			onChange={(evt) => attachFiles(evt.target.files!)}
			multiple
		/>
	);
};

export default FileAttacher;
