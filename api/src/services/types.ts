import type {
	BaseWebSocketMessagePayload, 
	MessageSegment
} from "@src/types";

export interface AssistantMessageSegmentPayload extends BaseWebSocketMessagePayload, MessageSegment { }
