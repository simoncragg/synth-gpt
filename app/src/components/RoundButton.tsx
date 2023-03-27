interface RoundButtonProps {
	ariaLabel: string;
	children: React.ReactNode;
	onClick: () => void;
}

export const RoundButton = ({
	ariaLabel,
	children,
	onClick,
}: RoundButtonProps) => {
	return (
		<button
			type="button"
			aria-label={ariaLabel}
			className="flex justify-center items-center w-[52px] h-[52px] rounded-full border border-gray-600 shadow-sm text-gray-400 bg-gray-700 hover:text-white hover:bg-gray-600 focus:ring-4 focus:outline-none focus:ring-gray-400"
			onClick={onClick}
		>
			{children}
		</button>
	);
};
