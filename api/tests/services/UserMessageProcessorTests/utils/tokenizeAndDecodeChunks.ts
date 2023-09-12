import tiktoken from "tiktoken-node";

export const tokenizeAndDecodeChunks = (str: string): string[] => {
	const tokenizer = tiktoken.getEncoding("cl100k_base");
	return tokenizer.encode(str).map(token => tokenizer.decode([token]));
};
