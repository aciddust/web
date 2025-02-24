def func(module, input_: str, stopwords: str) -> str:
    stopword_list = [
        _ for _ in (
        stopwords
        .replace("\r", " ")
        .replace("\n", " ")
        .replace("\t", " ")
        .replace(".", " ")
        .replace(",", " ")
        .replace(";", " ")
        .split(" ")
    ) if _ ]
    with module.CloudManager(
        auto_save=True,
        output="result",
    ) as cm:
        cm.set_text(input_)
        cm.set_stopwords(stopword_list)
        cm.set_font("PretendardVariable.ttf")
        cm.set_max_words(100)
        return cm.make_wordcloud_base64()
