import TextToSpeechService from "@services/TextToSpeechService";
import { postToConnectionAsync } from "@clients/apiGatewayManagementApiClient";

import type {
	Chat,
	ChatMessage,
} from "../types";

import type {
	BaseWebSocketMessagePayload,
	WebSocketMessage,
} from "../types";

import { 
	markdownImagePattern, 
	singleLineCodeBlockPattern
} from "../constants";

class AssistantVoiceProcessor {

	private readonly connectionId: string;
	private readonly chat: Chat;
	private readonly textToSpeechService: TextToSpeechService;

	constructor(connectionId: string, chat: Chat) {
		this.connectionId = connectionId;
		this.chat = chat;
		this.textToSpeechService = new TextToSpeechService();
	}

	public async process(message: ChatMessage) {
		
		let transcript = message.content as string;
		transcript = this.removeCodeBlocks(transcript);
		transcript = this.removeMarkdownImages(transcript);

		if (transcript.length === 0) {
			return;
		}

		const audioSegment = await this.generateAudioSegmentAsync(transcript);
		const { chatId } = this.chat;

		await postToConnectionAsync(this.connectionId, {
			type: "assistantAudioSegment",
			payload: {
				chatId,
				audioSegment,
			} as AssistantAudioSegmentPayload
		} as WebSocketMessage);
	}

	private removeCodeBlocks(transcript: string) {
		return transcript.replace(singleLineCodeBlockPattern, "");
	}

	private removeMarkdownImages(transcript: string) {
		return transcript.replace(markdownImagePattern, "");
	}

	private async generateAudioSegmentAsync(transcript: string): Promise<AudioSegment> {
		const timestamp = Date.now();
		const audioUrl = await this.textToSpeechService.generateSignedAudioUrlAsync(transcript);
		return {
			audioUrl,
			timestamp,
		};
	}
}

export default AssistantVoiceProcessor;

export interface AssistantAudioSegmentPayload extends BaseWebSocketMessagePayload {
	audioSegment: AudioSegment;
}

export interface AudioSegment {
	audioUrl: URL;
	timestamp: number;
}
