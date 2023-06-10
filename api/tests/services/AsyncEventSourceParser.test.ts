import { AsyncEventSourceParser } from "@services/AsyncEventSourceParser";

describe("AsyncEventSourceParser", () => {

	const onParseAsyncSpy = jest.fn();

	afterEach(() => {
		onParseAsyncSpy.mockClear();
	});

	it("should output a complete event contained within a single chunk", async () => {
		const parser = new AsyncEventSourceParser(onParseAsyncSpy);

		await parser.feedAsync("data: test\n\n");

		expect(onParseAsyncSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				type: "event",
				data: "test",
			})
		);
	});

	it("should output a complete event contained within a single chunk with BOM", async () => {
		const byteOrderMark = new Uint8Array([239, 187, 191]);
		const decoder = new TextDecoder("utf-8");
		const bom = decoder.decode(byteOrderMark);
		const parser = new AsyncEventSourceParser(onParseAsyncSpy);

		await parser.feedAsync(bom + "data: test\n\n");

		expect(onParseAsyncSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				type: "event",
				data: "test",
			})
		);
	});

	it("should output a complete event contained within a single chunk with spaces", async () => {
		const parser = new AsyncEventSourceParser(onParseAsyncSpy);

		await parser.feedAsync("data: testing 123 testing 123\n\n");

		expect(onParseAsyncSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				type: "event",
				data: "testing 123 testing 123",
			})
		);
	});

	it("should output a complete event split across multiple chunks", async () => {
		const parser = new AsyncEventSourceParser(onParseAsyncSpy);

		await parser.feedAsync("data: ");
		await parser.feedAsync("test\n\n");

		expect(onParseAsyncSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				type: "event",
				data: "test",
			})
		);
	});

	it("should output multiple events over multiple chunks", async () => {
		const parser = new AsyncEventSourceParser(onParseAsyncSpy);

		await parser.feedAsync("data: test1\n\n");
		await parser.feedAsync("data: test2\n\n");

		expect(onParseAsyncSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				type: "event",
				data: "test1",
			})
		);

		expect(onParseAsyncSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				type: "event",
				data: "test2",
			})
		);
	});

	it("should output multiple events split over multiple chunks", async () => {
		const parser = new AsyncEventSourceParser(onParseAsyncSpy);

		await parser.feedAsync("data: ");
		await parser.feedAsync("test1\n\n");
		await parser.feedAsync("data: ");
		await parser.feedAsync("test2\n\n");

		expect(onParseAsyncSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				type: "event",
				data: "test1",
			})
		);

		expect(onParseAsyncSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				type: "event",
				data: "test2",
			})
		);
	});

	it("feeds chunks with a retry field", async () => {
		const parser = new AsyncEventSourceParser(onParseAsyncSpy);

		await parser.feedAsync("retry: 1000\n\n");

		expect(onParseAsyncSpy).toHaveBeenCalledWith({
			type: "reconnect-interval",
			value: 1000,
		});
	});
});
