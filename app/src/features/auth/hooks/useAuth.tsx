import { useAuth0 } from "@auth0/auth0-react";
import { useState, useEffect } from "react";

type AuthHook = {
	userId: string | null;
};

const useAuth = (): AuthHook => {
	const auth0 = useAuth0();
	const [userId, setUserId] = useState<string | null>(null);

	useEffect(() => {
		{
			const { user } = auth0;
			const sub = user?.sub;
			if (sub) {
				const userId = sub?.replace("auth0|", "");
				setUserId(userId);
			}
		}
	}, [auth0]);

	return {
		userId,
	};
};

export default useAuth;
