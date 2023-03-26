import { useState } from "react";
import { AiFillGithub } from "react-icons/ai";
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import { RiAddFill, RiCloseFill, RiVoiceprintFill } from "react-icons/ri";

const Navbar = () => {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	return (
		<>
			<nav className="fixed top-0 z-50 w-full border-b bg-gray-800 border-gray-700 sm:hidden">
				<div className="px-3 py-3 lg:px-5 lg:pl-3">
					<div className="flex items-center justify-between">
						<div className="flex items-center">
							<div className="flex items-center">
								<button
									type="button"
									className="inline-flex items-center p-2 text-sm rounded-lg focus:outline-none focus:ring-2 text-gray-400 hover:bg-gray-700 focus:ring-gray-600"
									onClick={() => setIsSidebarOpen(!isSidebarOpen)}
								>
									{isSidebarOpen ? (
										<>
											<span className="sr-only">Close sidebar</span>
											<RiCloseFill className="w-6 h-6" />
										</>
									) : (
										<>
											<span className="sr-only">Open sidebar</span>
											<HiOutlineMenuAlt2 className="w-6 h-6" />
										</>
									)}
								</button>
							</div>
						</div>
						<div className="flex items-center bg-gray-800">New chat</div>
						<div className="flex items-center">
							<div className="flex items-center">
								<button
									type="button"
									className="inline-flex items-center p-2 text-sm rounded-lg focus:outline-none focus:ring-2 text-gray-400 hover:bg-gray-700 focus:ring-gray-600"
								>
									<span className="sr-only">New chat</span>
									<RiAddFill className="w-6 h-6" />
								</button>
							</div>
						</div>
					</div>
				</div>
			</nav>

			<aside
				className={`fixed top-0 left-0 z-40 w-64 h-screen p-0 pt-2 transition-transform border-r sm:translate-x-0 bg-gray-800 border-gray-700 ${
					isSidebarOpen ? "transform-none" : "-translate-x-full"
				}`}
				aria-label="Sidebar"
			>
				<div className="p-4">
					<a href="/" className="flex gap-2">
						<RiVoiceprintFill className="text-blue-300 w-4 h-4 mt-1" />
						<span className="logo whitespace-nowrap text-white text-2xl">
							synth gpt
						</span>
					</a>
				</div>
				<div className="px-4 pb-4 overflow-y-auto bg-gray-800">
					<ul className="space-y-2">
						<li>
							<button
								type="button"
								className="flex w-full py-3 px-3 items-center gap-3 rounded-md hover:bg-gray-500/10 transition-colors duration-200 text-white cursor-pointer text-sm mb-2 flex-shrink-0 border border-white/20"
							>
								<RiAddFill className="w-5 h-5" />
								New chat
							</button>
						</li>
					</ul>
					<ul className="pt-4 mt-4 space-y-2 border-t border-gray-700">
						<li>
							<a
								href="https://github.com/simoncragg/synth-gpt"
								target="_blank"
								className="flex items-center p-2 text-base font-normal rounded-lg text-white bg-gray-800 hover:bg-gray-700"
							>
								<AiFillGithub className="w-6 h-6 text-gray-500" />
								<span className="flex-1 ml-3 whitespace-nowrap">Github</span>
							</a>
						</li>
					</ul>
				</div>
			</aside>
		</>
	);
};

export default Navbar;
