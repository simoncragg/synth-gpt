import io

lines = [
	"This is line 1 of the generated text.",
	"Here's line 2 with some more text.",
	"And line 3 for good measure.",
]

text = "\n".join(lines)

bytes_io = io.BytesIO(text.encode())
result = bytes_io
