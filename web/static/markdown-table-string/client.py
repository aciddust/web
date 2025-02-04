def func(module, input_: str) -> str:
    table = module.markdown_as_table(input_)
    if not table.header:
        return "테이블을 찾을 수 없습니다."
    if not table.body:
        return "테이블 정보가 올바르지 않습니다."
    return module.convert_table_as_multiline_text(table)
