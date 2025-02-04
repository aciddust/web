from enum import Enum
from typing import List
from dataclasses import dataclass


class Message(Enum):
    TABLE_NOT_FOUND = "테이블을 찾을 수 없습니다."
    WRONG_TABLE_INFO = "테이블 정보가 올바르지 않습니다."


@dataclass
class Table:
    header: List[str]
    body: List[List[str]]


def read_markdown_as_text(path) -> str:
    with open(path, "r", encoding="utf-8") as file:
        return file.read()


def calc_pad_of_each_column(table: Table) -> List[int]:
    max_column_length_list = [len(column) for column in table.header]
    for row in table.body:
        for i, element in enumerate(row):
            max_column_length_list[i] = max(max_column_length_list[i], len(element))
    return max_column_length_list


def markdown_as_table(text: str) -> Table:
    rows = text.split("\n")
    try:
        table_ = [
            [element.strip() for element in row.split("|")[1:-1]] for row in rows if row
        ]
    except IndexError:
        return Table(header=[], body=[])
    table = Table(header=table_[0], body=table_[2:])
    return table


def read_markdown_as_table(path) -> Table:
    text = read_markdown_as_text(path)
    return markdown_as_table(text)


def convert_table_as_multiline_text(table: Table) -> str:
    try:
        pad_list = calc_pad_of_each_column(table)
    except IndexError:
        return Message.WRONG_TABLE_INFO.value
    result = "```\n"
    result += (
        "    ".join(
            [f"{element:<{pad_list[i]}}" for i, element in enumerate(table.header)]
        )
        + "\n"
    )
    for row in table.body:
        result += (
            "    ".join(
                [f"{element:<{pad_list[i]}}" for i, element in enumerate(row)]
            )
            + "\n"
        )
    result += "```\n"

    return result
