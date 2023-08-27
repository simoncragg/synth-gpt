import userEvent from "@testing-library/user-event";
import { v4 as uuidv4 } from "uuid";

import ChatModelSelector from "./ChatModelSelector";
import { renderWithProviders } from "../../../utils/test-utils";
import { waitFor } from "@testing-library/react";

describe("ChatModelSelector", () => {

    const gpt35turbo = "gpt-3.5-turbo";
    const gpt4 = "gpt-4";

    it("should highlight the correct chat model when rendered", () => {
        const { getByTestId } = renderChatModelSelector(gpt35turbo);
        expect(getByTestId("GPT-3.5")).toHaveClass("border-zinc-600");
        expect(getByTestId("GPT-4")).not.toHaveClass("border-zinc-600");
    });

	it("should highlight the newly selected chat model", async () => {
        const { getByText, getByTestId } = renderChatModelSelector(gpt35turbo);

		userEvent.click(getByText("GPT-4"));

		await waitFor(() => {
        	expect(getByTestId("GPT-3.5")).not.toHaveClass("border-zinc-600");
        	expect(getByTestId("GPT-4")).toHaveClass("border-zinc-600");
		});
    });

    it("should update the store with the newly selected chat model", async () => {
        const { store, getByText } = renderChatModelSelector(gpt35turbo);

        userEvent.click(getByText("GPT-4"));

        await waitFor(() => {
            const state = store.getState();
            expect(state.chat.model).toBe(gpt4);
        });
    });

  const renderChatModelSelector = (initialModel: ChatModelType) => {
    return renderWithProviders(<ChatModelSelector />, {
        preloadedState: { 
            chat: {
                chatId: uuidv4(),
                model: initialModel,
                title: "New chat",
                transcript: "",
                attachments: [],
                messages: [],
            },
        },
    });
  }
});
