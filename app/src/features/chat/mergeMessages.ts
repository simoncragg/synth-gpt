export function mergeMessages(
	existingMessage: ChatMessage, 
	newMessage: ChatMessage, 
	isLastSegment: boolean)
{
	let mergedMessage = { ...existingMessage };
	
	if (newMessage.content) {
		mergedMessage.content = `${mergedMessage.content}${newMessage.content}`
	}
	
	if (newMessage.activity?.type === "codingActivity") {
		const existingCodeActivity = existingMessage.activity?.value as CodingActivity;
		const newCodingActivity = newMessage.activity?.value as CodingActivity;

		mergedMessage.activity = {
			...newMessage.activity,
			value: {
				...newCodingActivity,
				code: mergeCode(existingCodeActivity, newCodingActivity, isLastSegment),
			},
		};
	}
	else {
		mergedMessage.activity = newMessage.activity;
	}

	return mergedMessage;
}

function mergeCode(existingCodeActivity: CodingActivity, newCodingActivity: CodingActivity, isLastSegment: boolean) {
	return (newCodingActivity.currentState === "working" && !isLastSegment)
		? `${existingCodeActivity?.code ?? ""}${newCodingActivity?.code ?? ""}`
		: newCodingActivity.code;
}
