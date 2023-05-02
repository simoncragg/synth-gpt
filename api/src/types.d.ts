interface BaseResponseBody {
	success: boolean;
	error?: string;
}

interface GetChatResponseBody extends BaseResponseBody {
	chat: Chat;
}

interface GetChatsResponseBody extends BaseResponseBody {
	chats: ChatWithoutMessages[];
}

interface GenerateTitleResponseBody extends BaseResponseBody {
	chatId: string;
	title: string;
}

/* websocket messages */

type WebSocketMessageType = "assistantMessage" | "assistantAudio";

interface WebSocketMessage {
	type: WebSocketMessageType;
	payload: BasePayload;
}

interface BaseWebSocketMessagePayload {
	chatId: string;
}

interface AssistantMessagePayload extends BaseWebSocketMessagePayload {
	message: BaseMessage;
}

interface AssistantAudioPayload extends BaseWebSocketMessagePayload {
	transcript: string;
	audioUrl: string;
}

/* Invoke handler payloads */

interface ProcessUserMessagePayload {
	connectionId: string;
	chatId: string;
	userId: string;
	message: ChatMessage;
}

/* models */

interface Chat {
	chatId: string;
	title: string;
	userId: string;
	messages: ChatMessage[];
	createdTime: number;
	updatedTime: number;
}

type ChatWithoutMessages = Omit<Chat, "messages">;

type RoleType = "system" | "user" | "assistant";

interface Message {
	role: RoleType
	content: string
}

interface ChatMessage {
	id: string;
	role: RoleType;
	content: Content,
	timestamp: number;
}

type ContentType = "text" | "webActivity";

interface Content {
	type: ContentType;
	value: string | WebActivity;
}

type WebBrowsingStateType = "searching" | "readingResults" | "finished";

interface WebActivity {
	searchTerm: string;
	currentState: WebBrowsingStateType;
	actions: BaseWebBrowsingAction[];
}

interface BaseWebBrowsingAction {
	type: WebBrowsingStateType;
}

interface SearchingWebAction extends BaseWebBrowsingAction {
	type: "searching";
	searchTerm: string;
}

interface ReadingWebSearchResultsAction extends BaseWebBrowsingAction {
	type: "readingResults";
	results: WebSearchResult[];
}

interface WebSearchResult {
	name: string;
	url: string;
	isFamilyFriendly: boolean;
	snippet: string;
}

/* Bing Search proxy */

interface WebSearchResponse {
	queryContext: QueryContext;
	webPages: WebPages;
}

interface QueryContext {
	originalQuery: string;
	alteredQuery?: string;
	alterationDisplayQuery?: string;
	alterationOverrideQuery?: string;
	adultIntent?: boolean;
}

interface WebPages {
	webSearchUrl: string;
	totalEstimatedMatches?: number;
	value: WebPage[];
}

interface WebPage {
	id: string;
	name: string;
	url: string;
	isFamilyFriendly: boolean;
	displayUrl: string;
	snippet: string;
	dateLastCrawled: string;
	language: string;
	isNavigational: boolean;
}
