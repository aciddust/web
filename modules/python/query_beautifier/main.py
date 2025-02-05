import sys

from func import beautify_query

if __name__ == "__main__":
    try:
        input_path = sys.argv[1]
    except IndexError:
        input_path = "INPUT.sql"

    try:
        output_path = sys.argv[2]
    except IndexError:
        output_path = "OUTPUT.sql"

    with open(input_path, "r", encoding="utf-8") as file:
        raw_query = file.read()
    beautified_query = beautify_query(raw_query)
    with open(output_path, "w", encoding="utf-8") as file:
        file.write(beautified_query)
