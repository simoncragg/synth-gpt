import { configureStore, combineReducers, getDefaultMiddleware, PreloadedState } from "@reduxjs/toolkit";
import { chatApi } from "./services/chatApi";
import chatSlice from "./features/chat/chatSlice";

const rootReducer = combineReducers({
	chat: chatSlice.reducer,
	chatApi: chatApi.reducer
});

export const setupStore = (preloadedState?: PreloadedState<RootStateType>) => {
	return configureStore({
		reducer: rootReducer,
		middleware: getDefaultMiddleware().concat(chatApi.middleware),
		preloadedState,
	});
};

export const store = setupStore();

export type RootStateType = ReturnType<typeof rootReducer>;
export type AppStoreType = ReturnType<typeof setupStore>;
export type AppDispatchType = AppStoreType["dispatch"];
