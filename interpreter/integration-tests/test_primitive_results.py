import requests
import unittest

class TestPrimitiveResults(unittest.TestCase):

    def test_string_result(self):
        (status_code, type, value) = self.post((
            "str1 = \"Hello\"\n"
            "str2 = \"world\"\n"
            "result = str1 + \" \" + str2"
        ))
        self.assertEqual(status_code, 200)
        self.assertEqual(type, "string")
        self.assertEqual(value, "Hello world")

    def test_int_result(self):
        (status_code, type, value) = self.post((
            "result = (5 + 3) * 2 - 7"
        ))
        self.assertEqual(status_code, 200)
        self.assertEqual(type, "string")
        self.assertEqual(value, "9")

    def test_float_result(self):
        (status_code, type, value) = self.post((
            "import math\n"
            "result = math.sqrt(144)"
        ))
        self.assertEqual(status_code, 200)
        self.assertEqual(type, "string")
        self.assertEqual(value, "12.0")

    def test_bool_result_true(self):
        (status_code, type, value) = self.post((
            "result = \"hello\" != \"world\""
        ))
        self.assertEqual(status_code, 200)
        self.assertEqual(type, "string")
        self.assertEqual(value, "True")

    def test_bool_result_false(self):
        (status_code, type, value) = self.post((
            "result = \"hello\" == \"world\""
        ))
        self.assertEqual(status_code, 200)
        self.assertEqual(type, "string")
        self.assertEqual(value, "False")

    def test_list_result(self):
        (status_code, type, value) = self.post((
            "num_list = []\n"
            "num_list.append(1)\n"
            "num_list.append(2)\n"
            "result = num_list"
        ))
        self.assertEqual(status_code, 200)
        self.assertEqual(type, "string")
        self.assertEqual(value, "[1, 2]")

    def test_error_response(self):
        (status_code, errorMessage, errorType, stackTrace) = self.post((
            "str1 = \"Hello\"\n"
            "result = str1 + 1"
        ))
        self.assertEqual(status_code, 200)
        self.assertEqual(errorMessage, "can only concatenate str (not \"int\") to str")
        self.assertEqual(errorType, "TypeError")
        self.assertGreater(len(stackTrace), 1)

    def post(self, code):
        url = "http://localhost:9000/2015-03-31/functions/function/invocations"
        payload = { "code": code }
        response = requests.post(url, json=payload)

        data = response.json()
        errorMessage = data.get("errorMessage")
        if (errorMessage == None):
            return (response.status_code, data.get("type"), data.get("value"))
        else:
            errorType = data.get("errorType")
            stackTrace = data.get("stackTrace")
            return (response.status_code, errorMessage, errorType, stackTrace)

if __name__ == '__main__':
    unittest.main()
