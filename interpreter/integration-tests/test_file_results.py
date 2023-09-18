import requests
import unittest

class TestFileContentResults(unittest.TestCase):

    def test_image_file_result(self):
        code = self.read_file("test-files/gen_image_file.py")
        (status_code, type, mime_type, b64_encoded_content) = self.post(code)
        self.assertEqual(status_code, 200)
        self.assertEqual(type, "file")
        self.assertEqual(mime_type, "image/png")
        self.assertIsNotNone(b64_encoded_content)

    def test_text_file_result(self):
        code = self.read_file("test-files/gen_text_file.py")
        (status_code, type, mime_type, b64_encoded_content) = self.post(code)
        self.assertEqual(status_code, 200)
        self.assertEqual(type, "file")
        self.assertEqual(mime_type, "text/plain")
        self.assertIsNotNone(b64_encoded_content)

    def read_file(self, file_path):
        try:
            with open(file_path, 'r') as file:
                content = file.read()
            return content
        finally:
            file.close()

    def post(self, code):
        url = "http://localhost:9000/2015-03-31/functions/function/invocations"
        payload = { "code": code }
        response = requests.post(url, json=payload)

        data = response.json()
        errorMessage = data.get("errorMessage")
        if (errorMessage == None):
            return (
                response.status_code, 
                data.get("type"), 
                data.get("mime_type"), 
                data.get("b64_encoded_content")
            )
        else:
            errorType = data.get("errorType")
            stackTrace = data.get("stackTrace")
            return (response.status_code, errorMessage, errorType, stackTrace)

if __name__ == "__main__":
    unittest.main()
