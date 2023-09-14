import okaidia from "react-syntax-highlighter/dist/esm/styles/prism/okaidia";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";

import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";

SyntaxHighlighter.registerLanguage("bash", bash);

interface ExecutionSummaryProps {
	summary: CodeExecutionSummary;
}

const ExecutionSummary = ({ 
	summary: { success, result, error }
}: ExecutionSummaryProps) => {

	return (
		<div className="bg-black mb-4 rounded-md">
			
			<SyntaxHighlighter 
				data-testid="executionSummary" 
				language="bash" 
				showLineNumbers={false} 
				style={okaidia} 
				customStyle={{ 
					marginTop: 0, 
					background: "#000000", 
					borderLeft: `solid 4px ${success ? "#00FF00B3" : "#FF0000B3"}`
				}}
			>
	  			{ result ?? error ?? "No data" }
			</SyntaxHighlighter>
		</div>
	);
};

export default ExecutionSummary;
