
import { Attachment, CodeAttachment, FileAttachment } from "src/types";

class AttachmentMapper {
	
	public mapToMarkdownString(attachment: Attachment): string {
		if (attachment.type === "File") {
			const { file } = attachment as FileAttachment;
			return `\`\`\`${file.name}\n${file.contents}\n\`\`\`\n\n`;
		}
		if (attachment.type === "CodeSnippet") {
			const {	content: { language, code } } = attachment as CodeAttachment;
			return `\`\`\`${language}\n${code}\n\`\`\`\n\n`;
		}
	}
}

export default AttachmentMapper;
