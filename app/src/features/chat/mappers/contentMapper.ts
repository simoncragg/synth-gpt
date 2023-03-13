export function mapToContentParts(content: string): MessagePart[] {
	const parts = [];
	const lines = content.split("\n");

	let numberedPoints: string[] = [];

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (isNumberedPoint(line)) {
			numberedPoints.push(line);
		}
		else {
			if (numberedPoints.length > 0) {
				parts.push({
					type: "OrderedList",
					items: numberedPoints,
				} as OrderedList);
				numberedPoints = [];
			}
			parts.push({
				type: "Paragraph",
				text: line
			} as Paragraph);
		}
	}

	if (numberedPoints.length > 0) {
		parts.push({
			type: "OrderedList",
			items: numberedPoints,
		} as OrderedList);
	}

	return parts;
}

function isNumberedPoint(line: string): boolean {
	return /^\d+\.\s/.test(line);
}
