from radon.complexity import cc_visit

def calculate_complexity(code: str) -> int:
    """
    Calculates Cyclomatic Complexity using Radon.
    Returns 0 if it fails or if code is empty.
    """
    if not code or not code.strip():
        return 0
        
    try:
        blocks = cc_visit(code)
        if not blocks:
            return 0
        # Sum of the complexity of all blocks (functions, classes) in the file
        return sum(block.complexity for block in blocks)
    except Exception as e:
        print(f"Radon complexity parsing error: {e}")
        return 0
