import { withAuthenticationRequired } from "@auth0/auth0-react";
import React from "react";
import LoadingPage from "../pages/LoadingPage";

interface AuthenticationGuardProps {
	component: React.ComponentType<object>;
}

const AuthenticationGuard = ({ component }: AuthenticationGuardProps) => {
	const Component = withAuthenticationRequired(component, {
		onRedirecting: () => <LoadingPage />,
	});

	return <Component />;
};

export default AuthenticationGuard;
