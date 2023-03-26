import Navbar from "./components/Navbar";
import Chat from "./pages/Chat";

const App = () => {
	return (
		<>
			<Navbar />

			<div className="flex flex-col w-full sm:left-[256px]">
				<Chat />
			</div>
		</>
	);
};

export default App;
