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
		<div className="flex flex-col">
			<HeroSection />

			<div className="flex gap-5 m-auto">
				<Button gradientDuoTone="purpleToPink" onClick={handleLogin}>
					Log In
				</Button>

				<Button gradientDuoTone="cyanToBlue" onClick={handleSignUp}>
					Sign Up
				</Button>
			</div>

			<span
				className={`mt-8 text-sm m-auto opacity-${signUpNoticeOpacity} ease-in duration-100 rounded-full px-2 text-gray-200`}
			>
				Sorry, but Sign Up is not available at this time.
			</span>
		</div>
	);
};

export default LoginPage;
