import { useDispatch } from "react-redux";

import AttachedFile from "./AttachedFile";
import Code from "../../../components/Code";
import { removeAttachment } from "../chatSlice";

interface AttachmentsProps {
	attachments: Attachment[];
	allowDeletions: boolean;
}

const Attachments = ({ attachments, allowDeletions }: AttachmentsProps) => {
	const dispatch = useDispatch();

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
		</>
	);
};

export default Attachments;
