/**
 * EventSource/Server-Sent Events parser
 * @see https://html.spec.whatwg.org/multipage/server-sent-events.html
 *
 * This is an async adaptation of the eventsource-parser library {@link https://github.com/rexxars/eventsource-parser}, 
 * which is licensed under the MIT license.
 */

const BOM = [239, 187, 191];

export class AsyncEventSourceParser {

	// Processing state
	private isFirstChunk: boolean;
	private buffer: string;
	private startingPosition: number;
	private startingFieldLength: number;

	// Event state
	private eventId: string | undefined;
	private eventName: string | undefined;
	private data: string;

	private onParseAsync: EventSourceParseCallbackAsync;

	constructor(onParseAsync: EventSourceParseCallbackAsync) {
		this.onParseAsync = onParseAsync;
		this.reset();
	}

	reset(): void {
		this.isFirstChunk = true;
		this.buffer = "";
		this.startingPosition = 0;
		this.startingFieldLength = -1;

		this.eventId = undefined;
		this.eventName = undefined;
		this.data = "";
	}

	async feedAsync(chunk: string): Promise<void> {
		this.buffer = this.buffer ? this.buffer + chunk : chunk;

		// Strip any UTF8 byte order mark (BOM) at the start of the stream.
		// Note that we do not strip any non - UTF8 BOM, as eventsource streams are
		// always decoded as UTF8 as per the specification.
		if (this.isFirstChunk && this.hasBOM(this.buffer)) {
			this.buffer = this.buffer.slice(BOM.length);
		}

		this.isFirstChunk = false;

		// Set up chunk-specific processing state
		const length = this.buffer.length;
		let position = 0;
		let discardTrailingNewline = false;

		// Read the current buffer byte by byte
		while (position < length) {
			if (discardTrailingNewline) {
				if (this.buffer[position] === "\n") {
					++position;
				}
				discardTrailingNewline = false;
			}

			let lineLength = -1;
			let fieldLength = this.startingFieldLength;
			let character: string;

			for (let index = this.startingPosition; lineLength < 0 && index < length; ++index) {
				character = this.buffer[index];
				if (character === ":" && fieldLength < 0) {
					fieldLength = index - position;
				} else if (character === "\r") {
					discardTrailingNewline = true;
					lineLength = index - position;
				} else if (character === "\n") {
					lineLength = index - position;
				}
			}

			if (lineLength < 0) {
				this.startingPosition = length - position;
				this.startingFieldLength = fieldLength;
				break;
			} else {
				this.startingPosition = 0;
				this.startingFieldLength = -1;
			}

			await this.parseEventStreamLine(this.buffer, position, fieldLength, lineLength);

			position += lineLength + 1;
		}

		if (position === length) {
			// If we consumed the entire buffer to read the event, reset the buffer
			this.buffer = "";
		} else if (position > 0) {
			// If there are bytes left to process, set the buffer to the unprocessed
			// portion of the buffer only
			this.buffer = this.buffer.slice(position);
		}
	}

	private async parseEventStreamLine(
		lineBuffer: string,
		index: number,
		fieldLength: number,
		lineLength: number
	) {
		if (lineLength === 0) {
			// We reached the last line of this event
			if (this.data.length > 0) {
				console.log({
					type: "event",
					id: this.eventId,
					event: this.eventName || undefined,
					data: this.data.slice(0, -1), // remove trailing newline
				});
				await this.onParseAsync({
					type: "event",
					id: this.eventId,
					event: this.eventName || undefined,
					data: this.data.slice(0, -1), // remove trailing newline
				});

				this.data = "";
				this.eventId = undefined;
			}
			this.eventName = undefined;
			return;
		}

		const noValue = fieldLength < 0;
		const field = lineBuffer.slice(index, index + (noValue ? lineLength : fieldLength));
		let step = 0;

		if (noValue) {
			step = lineLength;
		} else if (lineBuffer[index + fieldLength + 1] === " ") {
			step = fieldLength + 2;
		} else {
			step = fieldLength + 1;
		}

		const position = index + step;
		const valueLength = lineLength - step;
		const value = lineBuffer.slice(position, position + valueLength).toString();

		if (field === "data") {
			this.data += value ? `${value}\n` : "\n";
		} else if (field === "event") {
			this.eventName = value;
		} else if (field === "id" && !value.includes("\u0000")) {
			this.eventId = value;
		} else if (field === "retry") {
			const retry = parseInt(value, 10);
			if (!Number.isNaN(retry)) {
				await this.onParseAsync({ type: "reconnect-interval", value: retry });
			}
		}
	}

	private hasBOM(buffer: string) {
		return BOM.every((charCode: number, index: number) => buffer.charCodeAt(index) === charCode);
	}
}

export interface AsyncEventSourceParser {
	feedAsync(chunk: string): Promise<void>;
	reset(): void;
}

export interface ParsedEvent {
	type: "event";
	event?: string;
	id?: string;
	data: string;
}

export interface ReconnectInterval {
	type: "reconnect-interval";
	value: number;
}

export type ParseEvent = ParsedEvent | ReconnectInterval;

export type EventSourceParseCallbackAsync = (event: ParseEvent) => Promise<void>;