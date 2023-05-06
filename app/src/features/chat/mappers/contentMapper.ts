import { v4 as uuidv4 } from "uuid";

type MapToPartFunction = (
	content: string,
	startIndex: number
) => [MessagePart, number];

const CODE_SNIPPET_MARKER = "```";

export function mapToContentParts(content: string): MessagePart[] {
	const parts: MessagePart[] = [];
	let index = 0;
	while (isInBounds(content, index)) {
		const char = content[index];
		const type = getPartType(content, index);
		const mapToPart = getMapToPartFunction(type);
		const [part, offset] = mapToPart(content, index);
		index += offset;

		while (isInBounds(content, index) && isSpaceOrNewLine(content[index])) {
			index++;
		}

		if (isErroneousCodeSnippet(part)) {
			const paragraphs = mapCodeSnippetToParagraphs(part as CodeSnippet);
			parts.push(...paragraphs);
			continue;
		}

		parts.push(part);
	}

	return parts;
}

function getPartType(content: string, startIndex: number): MessagePartType {
	if (isCodeSnippetMarker(content, startIndex)) {
		return "CodeSnippet";
	}
	if (isListItemNumber(content, startIndex)) {
		return "OrderedList";
	}
	return "Paragraph";
}

function getMapToPartFunction(type: MessagePartType): MapToPartFunction {
	if (type === "CodeSnippet") {
		return mapCodeSnippet;
	}
	if (type === "OrderedList") {
		return mapOrderedList;
	}
	return mapParagraph;
}

function mapParagraph(
	content: string,
	startIndex: number
): [Paragraph, number] {
	let offset = 0;
	let text = "";
	while (
		isInBounds(content, startIndex + offset) &&
		!isCodeSnippetMarker(content, startIndex + offset) &&
		!isListItemNumber(content, startIndex + offset) &&
		!isNewLine(content[startIndex + offset])
	) {
		text += content[startIndex + offset];
		offset++;
	}

	return [
		{
			type: "Paragraph",
			text: text.trim(),
		},
		offset,
	];
}

function mapOrderedList(
	content: string,
	startIndex: number
): [OrderedList, number] {
	const listItems: ListItem[] = [];
	let offset = 0;
	while (
		isInBounds(content, startIndex + offset) &&
		isListItemNumber(content, startIndex + offset)
	) {
		let text = content.substring(startIndex + offset, startIndex + offset + 3);
		offset += text.length;
		while (
			isInBounds(content, startIndex + offset) &&
			!isCodeSnippetMarker(content, startIndex + offset) &&
			!isListItemNumber(content, startIndex + offset) &&
			!isNewLine(content[startIndex + offset])
		) {
			text += content[startIndex + offset];
			offset++;
		}

		listItems.push({
			id: uuidv4(),
			text: text.trim(),
		});

		while (
			isInBounds(content, startIndex + offset) &&
			isNewLine(content[startIndex + offset])
		) {
			offset++;
		}
	}

	return [
		{
			type: "OrderedList",
			listItems,
		},
		offset,
	];
}

function mapCodeSnippet(
	content: string,
	startIndex: number
): [CodeSnippet, number] {
	let offset = 0;
	while (
		isInBounds(content, startIndex + offset) &&
		content[startIndex + offset] === "`"
	) {
		offset++;
	}

	let language = "";
	while (
		isInBounds(content, startIndex + offset) &&
		!isSpace(content[startIndex + offset]) &&
		!isNewLine(content[startIndex + offset])
	) {
		language += content[startIndex + offset];
		offset++;
	}

	if (language.length === 0) {
		language = "bash";
	}

	while (
		isInBounds(content, startIndex + offset) &&
		isSpaceOrNewLine(content[startIndex + offset])
	) {
		offset++;
	}

	let code = "";
	while (
		isInBounds(content, startIndex + offset) &&
		!isCodeSnippetMarker(content, startIndex + offset)
	) {
		code += content[startIndex + offset];
		offset++;
	}

	while (
		isInBounds(content, startIndex + offset) &&
		content[startIndex + offset] === "`"
	) {
		offset++;
	}

	code = code.trim();
	if (!code.endsWith("\n")) {
		code += "\n";
	}

	return [
		{
			type: "CodeSnippet",
			language,
			code,
		},
		offset,
	];
}

function isErroneousCodeSnippet(messagePart: MessagePart): boolean {
	return (
		messagePart.type === "CodeSnippet" &&
		(messagePart as CodeSnippet).language === "language"
	);
}

function mapCodeSnippetToParagraphs({ code }: CodeSnippet): Paragraph[] {
	return code
		.split("\n")
		.filter((text) => text.length > 0)
		.map((text) => ({
			type: "Paragraph",
			text: text.trim(),
		}));
}

function isInBounds(content: string, index: number): boolean {
	return index < content.length;
}

function isCodeSnippetMarker(content: string, index: number): boolean {
	return (
		index + 2 < content.length &&
		content.substring(index, index + 3) === CODE_SNIPPET_MARKER
	);
}

function isListItemNumber(content: string, index: number): boolean {
	return (
		index + 2 < content.length &&
		!isNaN(Number(content[index])) &&
		content.substring(index + 1, index + 3) === ". "
	);
}

function isSpaceOrNewLine(char: string): boolean {
	return isSpace(char) || isNewLine(char);
}

function isNewLine(char: string): boolean {
	return char === "\n";
}

function isSpace(char: string): boolean {
	return char === " ";
}
