import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ChatPage from "./pages/ChatPage";

const App = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Navigate to="/chat" replace />} />
				<Route path="/chat" element={<ChatPage />} />
				<Route path="/chat/:chatId" element={<ChatPage />} />
			</Routes>
		</BrowserRouter>
	);
};

export default App;
