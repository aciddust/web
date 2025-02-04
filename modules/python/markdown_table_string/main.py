import sys

from func import (
    read_markdown_as_table,
    convert_table_as_multiline_text,
)

if __name__ == "__main__":
    try:
        input_path = sys.argv[1]
    except IndexError:
        input_path = "INPUT.md"

    try:
        output_path = sys.argv[2]
    except IndexError:
        output_path = "OUTPUT.txt"

    table = read_markdown_as_table(input_path)
    with open(output_path, "w", encoding="utf-8") as file:
        file.write(convert_table_as_multiline_text(table))
