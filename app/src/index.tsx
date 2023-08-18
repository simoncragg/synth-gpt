import "regenerator-runtime/runtime";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";

import App from "./App";
import Auth0ProviderWithNavigate from "./features/auth/providers/Auth0ProviderWithNavigate";
import { store } from "./store";
import "./index.css";

const root = ReactDOM.createRoot(
	document.getElementById("root") as HTMLElement
);

root.render(
	<React.StrictMode>
		<Provider store={store}>
			<BrowserRouter>
				<Auth0ProviderWithNavigate>
					<App />
				</Auth0ProviderWithNavigate>
			</BrowserRouter>
		</Provider>
	</React.StrictMode>
);
