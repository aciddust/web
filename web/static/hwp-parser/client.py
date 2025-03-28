def func(module, filename: str) -> str:
    try:
        text_list = []
        parser = module.HWPParser()
        parser.set_file_path(filename)
        for doc in parser.lazy_load():
            text_list.append(doc.page_content)
    except Exception as e:
        print('Error:', e)
        return "error"
    return "\n".join(text_list)
