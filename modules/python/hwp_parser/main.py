from func import HWPParser

if __name__ == "__main__":
    parser = HWPParser()
    parser.set_file_path("1.hwp")
    for doc in parser.lazy_load():
        print(doc.page_content)
