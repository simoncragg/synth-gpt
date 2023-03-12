import Chat from "./features/chat/Chat";
import { Navbar } from "flowbite-react";
import { AiFillGithub } from "react-icons/ai";
import { RiVoiceprintFill } from "react-icons/ri";

const App = () => {

	return (
		<>
			<Navbar
				fluid={true}
				rounded={false}
				className="fixed top-0 w-full z-40"
			>
				<Navbar.Brand>
					<RiVoiceprintFill className="text-blue-300 w-6 h-6" />
					<span className="logo pl-2 whitespace-nowrap text-2xl dark:text-white">
						synth
					</span>
				</Navbar.Brand>
				<Navbar.Toggle />
				<Navbar.Collapse>
					<Navbar.Link
						href="https://github.com/simoncragg/synth-gpt"
						target="_blank"
						active={true}
					>
						<AiFillGithub className="w-6 h-6" />
					</Navbar.Link>
				</Navbar.Collapse>
			</Navbar>

			<div className="mt-24 m-8">
				<Chat />
			</div>
		</>
	);
};

export default App;