import { useAuth0 } from "@auth0/auth0-react";
import { useState, useEffect } from "react";

type AuthHook = {
	userId: string | undefined;
	accessToken: string | undefined;
};

const useAuth = (): AuthHook => {
	const auth0 = useAuth0();
	const [userId, setUserId] = useState<string | undefined>();
	const [accessToken, setAccessToken] = useState<string | undefined>();

	useEffect(() => {
		{
			const { user } = auth0;
			const sub = user?.sub;
			if (sub) {
				const userId = sub?.replace("auth0|", "");
				setUserId(userId);
				auth0.getAccessTokenSilently().then((token) => setAccessToken(token));
			}
		}
	}, [auth0]);

	return {
		userId,
		accessToken,
	};
};

export default useAuth;
