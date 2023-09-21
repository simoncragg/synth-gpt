export const newChatText = "New chat";
export const isDev = process.env.STAGE === "dev";

export const prePrompt = [
	"Your name is Synth. ",
	"When providing code snippets, always include the language e.g. \"```python\".\n\n",
	`The current date is ${new Date().toDateString()}.`,
].join("");

export const singleLineCodeBlockPattern = /```[\s\S]*?```/g;
export const markdownImagePattern = /!\[(.*?)\]\(.*?\)/g;
