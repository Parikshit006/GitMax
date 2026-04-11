# Hardcoded constants that should be in environment variables
MAIN_DB_STR = "postgresql://usr:pwd@localhost:5432/db"
MAX_RETRIES_API_CALL = 3
API_URL_STAGE = "https://staging-api.example.com/v2"

def do_stuff_with_user(u_data):
    # Poor naming, unnecessary variables
    a = u_data.get("n")
    b = u_data.get("a")
    res_str = ""
    if a and b:
        res_str = f"{a} is {b} years old"
    return res_str

def do_stuff_with_admin(u_data):
    # Duplicated function logic
    a = u_data.get("n")
    b = u_data.get("a")
    res_str = ""
    if a and b:
        res_str = f"{a} is {b} years old"
    return res_str

def check_status(val):
    # Magic numbers and hardcoded checks
    if val == 1:
        return "OK"
    elif val == 2:
        return "WARN"
    elif val == 3:
        return "ERROR"
    elif val == 4:
        return "FATAL"
    return "UNKNOWN"
