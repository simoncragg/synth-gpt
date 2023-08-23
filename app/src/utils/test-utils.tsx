import React, { PropsWithChildren } from "react";
import type { PreloadedState } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { RenderOptions, render } from "@testing-library/react";

import { setupStore, AppStoreType, RootStateType } from "../store";

interface ExtendedRenderOptions extends Omit<RenderOptions, "queries"> {
	preloadedState?: PreloadedState<RootStateType>;
	store?: AppStoreType;
}

export function renderWithProviders(
	ui: React.ReactElement,
	{
		preloadedState = {},
		store = setupStore(preloadedState),
		...renderOptions
	}: ExtendedRenderOptions = {}
) {
	function Wrapper({ children }: PropsWithChildren<object>): JSX.Element {
		return <Provider store={store}>{children}</Provider>;
	}
	return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
