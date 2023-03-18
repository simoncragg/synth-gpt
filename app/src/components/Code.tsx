import { useEffect, useState } from "react";
import { FiClipboard } from "react-icons/fi";
import { MdDone } from "react-icons/md";
import Prism from "prismjs";

interface CodeProps {
	code: string;
	language: string;
}

const Code = ({ code, language }: CodeProps) => {

	useEffect(() => {
		Prism.highlightAll();
	}, []);

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
					{ !isCopied ? (
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
			<div className="Code">
				<pre className="line-numbers">
					<code data-testid="code" className={`language-${language}`}>{code}</code>
				</pre>
			</div>
		</div>
	);
};

export default Code;