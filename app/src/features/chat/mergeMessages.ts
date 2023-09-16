export function mergeMessages(existingMessage: ChatMessage, newMessage: ChatMessage, isLastSegment: boolean) {
	let mergedMessage: ChatMessage;
	if (newMessage.content.type === "text") {
		mergedMessage = mergeTextMessages(existingMessage, newMessage);
	}
	else if (newMessage.content.type === "codingActivity") {
		mergedMessage = mergeCodingActivities(existingMessage, newMessage, isLastSegment);
	}
	else {
		mergedMessage = newMessage;
	}
	return mergedMessage;
}

function mergeTextMessages(existingMessage: ChatMessage, newMessage: ChatMessage): ChatMessage {
	return {
		...existingMessage,
		content: {
			type: "text",
			value: `${existingMessage.content.value}${newMessage.content.value}`,
		},
	};
}

function mergeCodingActivities(
	existingMessage: ChatMessage, 
	newMessage: ChatMessage, 
	isLastSegment: boolean
): ChatMessage {

	const existingCodeActivity = existingMessage.content.value as CodingActivity;
	const newCodingActivity = newMessage.content.value as CodingActivity;

	console.log({isLastSegment});

	const code = mergeCode(existingCodeActivity, newCodingActivity, isLastSegment);

	return {
		...existingMessage,
		content: {
			type: "codingActivity",
			value: {
				...newCodingActivity,
				code,
			},
		},
	};
}

function mergeCode(existingCodeActivity: CodingActivity, newCodingActivity: CodingActivity, isLastSegment: boolean) {
	return (newCodingActivity.currentState === "working" && !isLastSegment)
		? `${existingCodeActivity.code}${newCodingActivity.code}`
		: newCodingActivity.code;
}
