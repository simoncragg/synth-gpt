interface TypingIndicatorProps {
	className: string;
}

const TypingIndicator = ({ className }: TypingIndicatorProps) => {
	return (
		<div className={className}>
			<span className="dot animate-loader"></span>
			<span className="dot animate-loader animation-delay-200"></span>
			<span className="dot animate-loader animation-delay-400"></span>
		</div>
	);
};

export default TypingIndicator;
