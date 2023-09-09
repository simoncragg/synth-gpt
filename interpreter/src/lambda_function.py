import ast
import types
from last_assigned_var_visitor import LastAssignedVarVisitor

# Lambda function

def handler(event, context):
    code_string = event["code"]
    print(code_string)
    last_assigned_var = get_last_assigned_var(code_string)
    if last_assigned_var:
        result = execute_code(code_string, last_assigned_var)
        return process_result(result)
    else:
        raise Exception("No assignment found in the code")
    
# Helper functions

def get_last_assigned_var(code_string):
    visitor = LastAssignedVarVisitor()
    lines = code_string.strip().split('\n')
    lines_to_check = lines[-1:]

    if len(lines) > 1:
        lines_to_check.append(lines[-2])

    for line in lines_to_check:
        parsed_code = ast.parse(line)
        visitor.visit(parsed_code)
        if (visitor.last_assigned_var):
            break

    return visitor.last_assigned_var

def execute_code(code_string, last_variable):
    ns = types.SimpleNamespace()
    exec(code_string, ns.__dict__)
    return ns.__dict__[last_variable]

def process_result(result):
    if (isinstance(result, str)):
        return string_response(result)
    elif (isinstance(result, (int, float, bool, list))):
        return string_response(str(result))
    else:
        raise Exception("Unsupported result type")

def string_response(value):
    return {
        "type": "string",
        "value": value 
    }
   