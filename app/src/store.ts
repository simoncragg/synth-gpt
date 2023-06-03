import {
	configureStore,
	combineReducers,
	getDefaultMiddleware,
	PreloadedState,
} from "@reduxjs/toolkit";

import chatSlice from "./features/chat/chatSlice";
import { authApi } from "./features/auth/authApi";
import { chatApi } from "./features/chat/chatApi";

const rootReducer = combineReducers({
	chat: chatSlice.reducer,
	chatApi: chatApi.reducer,
	authApi: authApi.reducer,
});

export const setupStore = (preloadedState?: PreloadedState<RootStateType>) => {
	return configureStore({
		reducer: rootReducer,
		middleware: getDefaultMiddleware({
			serializableCheck: false,
		}).concat(chatApi.middleware, authApi.middleware),
		preloadedState,
	});
};

export const store = setupStore();

export type RootStateType = ReturnType<typeof rootReducer>;
export type AppStoreType = ReturnType<typeof setupStore>;
export type AppDispatchType = AppStoreType["dispatch"];
