import { MockedClass } from "jest-mock";

import TextToSpeechService from "@services/TextToSpeechService";
import { baseAudioUrl } from "./constants";

export const arrangeTextToSpeechServiceMock = (TextToSpeechServiceMock: MockedClass<typeof TextToSpeechService>) => {
	TextToSpeechServiceMock
		.prototype
		.generateSignedAudioUrlAsync
		.mockImplementation((transcript) =>
			Promise.resolve(new URL(baseAudioUrl + encodeURIComponent(transcript) + ".mpg"))
		);
};
