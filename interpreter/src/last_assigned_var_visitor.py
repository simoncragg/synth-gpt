import ast

class LastAssignedVarVisitor(ast.NodeVisitor):
    def __init__(self):
        self.last_assigned_var = None

    def visit_Assign(self, node):
        for target in node.targets:
            if isinstance(target, ast.Name):
                self.last_assigned_var = target.id
