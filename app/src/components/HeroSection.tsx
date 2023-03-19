import { RiVoiceprintFill } from "react-icons/ri";

const HeroSection = () => {
	return (
		<div className="flex flex-col items-center mt-[20vh] p-4 text-center rounded-lg border-none sm:border sm:border-gray-700">
			<div className="flex align-center">
				<RiVoiceprintFill className="text-blue-300 w-12 h-12" />
				<span className="logo pl-2 whitespace-nowrap text-5xl text-white">
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
