import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";
import { Button } from "flowbite-react";
import HeroSection from "../../../components/HeroSection";

const LoginPage = () => {
	const { loginWithRedirect } = useAuth0();
	const [signUpNoticeOpacity, setSignUpNoticeOpacity] = useState("0");

	const handleLogin = async () => {
		await loginWithRedirect({
			appState: {
				returnTo: "/chat",
			},
		});
	};

	const handleSignUp = () => {
		setSignUpNoticeOpacity("100");
	};

	return (
		<div className="flex flex-col justify-center items-center h-screen">
			
			<div className="relative mb-[10vh]">
				<div className="relative flex flex-col items-center p-8 md:p-16 md:bg-black/75 md:border md:border-blue-300 rounded-2xl z-20">

					<HeroSection />

					<div className="flex w-full py-8 px-4 md:px-8 gap-5">
						
						<Button className="flex-1" gradientDuoTone="purpleToPink" outline size="xl" onClick={handleLogin}>
							Log In
						</Button>

						<Button className="flex-1" gradientDuoTone="cyanToBlue" outline size="xl" onClick={handleSignUp}>
							Sign Up
						</Button>
					</div>

					<span
						className={`mt-16 items-center text-sm opacity-${signUpNoticeOpacity} ease-in duration-100 rounded-full px-2 text-gray-200`}
					>
						Sorry, Sign Up is not available at this time
					</span>
				</div>
				<div className="hidden md:block absolute -inset-1 rounded-2xl blur-md bg-gradient-to-br from-pink-500 via-cyan-500 to-violet-500 z-10"></div>
			</div>
		</div>
	);
};

export default LoginPage;
