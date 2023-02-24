import { configureStore, combineReducers, PreloadedState } from "@reduxjs/toolkit";
import chatReducer from "./features/chat/chatSlice";

export const store = configureStore({
	reducer: {
		chat: chatReducer,
	},
});

const rootReducer = combineReducers({
	chat: chatReducer
});

export const setupStore = (preloadedState?: PreloadedState<RootState>) => {
	return configureStore({
		reducer: rootReducer,
		preloadedState
	});
};

export type RootState = ReturnType<typeof rootReducer>
export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore["dispatch"]