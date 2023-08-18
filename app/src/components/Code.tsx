import okaidia from "react-syntax-highlighter/dist/esm/styles/prism/okaidia";

import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import c from "react-syntax-highlighter/dist/esm/languages/prism/c";
import cpp from "react-syntax-highlighter/dist/esm/languages/prism/cpp";
import csharp from "react-syntax-highlighter/dist/esm/languages/prism/csharp";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import git from "react-syntax-highlighter/dist/esm/languages/prism/git";
import go from "react-syntax-highlighter/dist/esm/languages/prism/go";
import java from "react-syntax-highlighter/dist/esm/languages/prism/java";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import markup from "react-syntax-highlighter/dist/esm/languages/prism/markup";
import php from "react-syntax-highlighter/dist/esm/languages/prism/php";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import rust from "react-syntax-highlighter/dist/esm/languages/prism/rust";
import toml from "react-syntax-highlighter/dist/esm/languages/prism/toml";
import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import yaml from "react-syntax-highlighter/dist/esm/languages/prism/yaml";

import { FiClipboard } from "react-icons/fi";
import { MdDone } from "react-icons/md";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { useState } from "react";

SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("c", c);
SyntaxHighlighter.registerLanguage("cpp", cpp);
SyntaxHighlighter.registerLanguage("csharp", csharp);
SyntaxHighlighter.registerLanguage("css", css);
SyntaxHighlighter.registerLanguage("git", git);
SyntaxHighlighter.registerLanguage("go", go);
SyntaxHighlighter.registerLanguage("html", markup);
SyntaxHighlighter.registerLanguage("java", java);
SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("jsx", jsx);
SyntaxHighlighter.registerLanguage("markup", markup);
SyntaxHighlighter.registerLanguage("php", php);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("rust", rust);
SyntaxHighlighter.registerLanguage("toml", toml);
SyntaxHighlighter.registerLanguage("tsx", tsx);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("yaml", yaml);

interface CodeProps {
	code: string;
	language: string;
}

const Code = ({ code, language }: CodeProps) => {
	const [isCopied, setIsCopied] = useState(false);

	const copyToClipboard = () => {
		if (!isCopied) {
			navigator.clipboard.writeText(code);
			setIsCopied(true);
			setTimeout(() => {
				setIsCopied(false);
			}, 1000);
		}
	};

	return (
		<div className="bg-black mb-4 rounded-md">
			<div className="flex items-center relative text-gray-200 bg-gray-800 px-4 py-2 text-xs font-sans rounded-t">
				<span className="">{language}</span>
				<button className="flex ml-auto gap-2" onClick={copyToClipboard}>
					{!isCopied ? (
						<>
							<FiClipboard className="mt-0.5" />
							Copy code
						</>
					) : (
						<>
							<MdDone className="mt-0.5" />
							Copied
						</>
					)}
				</button>
			</div>
			<SyntaxHighlighter data-testid="code" showLineNumbers={true} language={language} style={okaidia} customStyle={{ marginTop: 0, background: "#000000" }}>
      			{code}
    		</SyntaxHighlighter>
		</div>
	);
};

export default Code;
