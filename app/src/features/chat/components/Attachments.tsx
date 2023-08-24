import { useDispatch } from "react-redux";
import { useState } from "react";

import AttachedFile from "./AttachedFile";
import Code from "../../../components/Code";
import { Modal } from "flowbite-react";
import { removeAttachment } from "../chatSlice";

interface AttachmentsProps {
	attachments: Attachment[];
	allowDeletions: boolean;
}

const Attachments = ({ attachments, allowDeletions }: AttachmentsProps) => {

	const [fileToPreview, setFileToPreview] = useState<AttachedFile | null>(null);
	const dispatch = useDispatch();

	const previewFileContents = (file: AttachedFile) => {
		console.log(file.name + "\n\n" + file.contents);
		setFileToPreview(file);
	}

	const deleteAttachment = (attachmentId: string) => {
		dispatch(removeAttachment({attachmentId}));
	};

	return (
		<>
			<div className="flex flex-start flex-row flex-wrap">
				{attachments
					.filter(a => a.type === "File")
					.map(a => a as FileAttachment)
					.map(attachment => (
						<div key={attachment.id} className="mr-4 mb-4">
							<AttachedFile 
								attachment={attachment} 
								onPreview={previewFileContents}
								onDelete={deleteAttachment} 
								canDelete={allowDeletions} />
						</div>
					))
				}
			</div>
					
			{attachments
				.filter(a => a.type === "CodeSnippet")
				.map(a => a as CodeAttachment)
				.map(({id, content: { language, code }}) => (
					<Code
						key={id}
						code={code}
						language={language}
					/>
				))
			}

			{fileToPreview && (
				<Modal
					show={true}
					size="7xl"
					onClose={() => setFileToPreview(null)}
				>
					<Modal.Header>
						<span className="flex w-full gap-2">
							{fileToPreview.name}
						</span>
					</Modal.Header>
					<Modal.Body>
						<div style={{ height: "50vh" }}>
							<textarea
								aria-label="input-code"
								className="w-full h-full resize-none whitespace-pre-wrap overflow-auto bg-gray-900 text-white focus:outline-blue-900 p-4"
								style={{ fontFamily: "Inter, 'Open Sans', sans-serif" }}
								readOnly={true}
								defaultValue={fileToPreview.contents}
							></textarea>
						</div>
					</Modal.Body>
				</Modal>
			)}
		</>
	);
};

export default Attachments;
