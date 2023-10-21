import { RiVoiceprintFill } from "react-icons/ri";

const HeroSection = () => {
	return (
		<div className="flex flex-col items-center mb-8 text-center rounded-lg border-none sm:border sm:border-gray-700">
			<div className="flex align-center gap-2 md:gap-3 lg:gap-4">
				<RiVoiceprintFill className="text-blue-300 w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" />
				<span className="logo whitespace-nowrap text-white text-6xl lg:text-7xl">
					synth gpt
				</span>
			</div>
			<p className="pt-8 mb-5 text-base sm:text-lg text-blue-200">
				Your friendly, intelligent voice assistant
			</p>
		</div>
	);
};

export default HeroSection;
