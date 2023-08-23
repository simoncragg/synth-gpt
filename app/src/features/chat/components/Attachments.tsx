import AttachedFile from "./AttachedFile";
import Code from "../../../components/Code";

interface AttachmentsProps {
	attachments: Attachment[];
}

const Attachments = ({ attachments }: AttachmentsProps) => {

	return (
		<>
			<div className="flex flex-start flex-row flex-wrap">
				{attachments
					.filter(a => a.type === "File")
					.map(a => a as FileAttachment)
					.map(attachment => (
						<div key={attachment.id} className="mr-4 mb-4">
							<AttachedFile attachment={attachment} />
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
