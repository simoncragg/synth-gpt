import Navbar from "./components/Navbar";
import Chat from "./pages/Chat";

const App = () => {
	
	return (
		<>
			<Navbar />

			<div className="flex flex-col">
				<Chat />
			</div>
		</>
	);
};

export default App;