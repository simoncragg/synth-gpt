import { Auth0Provider, AppState } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

interface Auth0ProviderWithNavigateProps {
	children: React.ReactNode;
}

const Auth0ProviderWithNavigate = ({
	children,
}: Auth0ProviderWithNavigateProps) => {
	const navigate = useNavigate();

	const domain = process.env.REACT_APP_AUTH0_DOMAIN;
	const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;
	const redirectUri = process.env.REACT_APP_AUTH0_CALLBACK_URL;

	const onRedirectCallback = (appState: AppState | undefined) => {
		navigate(appState?.returnTo || window.location.pathname);
	};

	if (!(domain && clientId && redirectUri)) {
		return null;
	}

	return (
		<Auth0Provider
			domain={domain}
			clientId={clientId}
			authorizationParams={{
				redirect_uri: redirectUri,
			}}
			onRedirectCallback={onRedirectCallback}
		>
			{children}
		</Auth0Provider>
	);
};

export default Auth0ProviderWithNavigate;
