import { useEffect } from "react";
import Prism from "prismjs";

interface CodeProps {
	code: string;
	language: string;
}

const Code = ({ code, language }: CodeProps) => {

	useEffect(() => {
		Prism.highlightAll();
	}, []);

	return (
		<div className="bg-black mb-4 rounded-md">
			<div className="flex items-center relative text-gray-200 bg-gray-800 px-4 py-2 text-xs font-sans rounded-t">
				<span className="">{language}</span>
			</div>
			<div className="Code">
				<pre className="line-numbers">
					<code data-testid="code" className={`language-${language}`}>{code}</code>
				</pre>
			</div>
		</div>
	);
};

export default Code;