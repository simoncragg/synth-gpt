import { MockedClass, mocked } from "jest-mock";

import TextToSpeechService from "@services/TextToSpeechService";
import { baseAudioUrl } from "./constants";

jest.mock("@services/TextToSpeechService");

class TextToSpeechServiceMockUtility {

	private readonly textToSpeechServiceMock: MockedClass<typeof TextToSpeechService>;

	constructor() {
		this.textToSpeechServiceMock = mocked(TextToSpeechService);
	}

	arrangeSignedAudioUrls() {
		this.textToSpeechServiceMock
			.prototype
			.generateSignedAudioUrlAsync
			.mockImplementation((transcript) =>
				Promise.resolve(new URL(baseAudioUrl + encodeURIComponent(transcript) + ".mpg"))
			);
	}
}

export default TextToSpeechServiceMockUtility;
