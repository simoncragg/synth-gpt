import { Navigate, Route, Routes } from "react-router-dom";
import AuthenticationGuard from "./features/auth/components/AuthenticationGuard";
import CallbackPage from "./features/auth/pages/CallbackPage";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./features/auth/pages/LoginPage";

const App = () => {
	return (
		<Routes>
			<Route path="/" element={<Navigate to="/chat" replace />} />
			<Route path="/login" element={<LoginPage />} />
			<Route path="/callback" element={<CallbackPage />} />
			<Route path="/chat" element={<ChatPage key="new-chat" />} />
			<Route
				path="/chat/:chatId"
				element={<AuthenticationGuard component={ChatPage} />}
			/>
		</Routes>
	);
};

export default App;
