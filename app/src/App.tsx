import SpeechToText from "./features/chat/SpeechToText";
import ChatLog from "./features/chat/ChatLog";
import "./App.css";

const App = () => {

	return (
		<div className="app-container">
			<div className="chat-container">
				<SpeechToText />
				<ChatLog />
			</div>
		</div>
	);
};

export default App;