def func(module, input_: str, stopwords: set) -> str:
    stopwords_ = set(" ".join(stopwords.split(",")).strip().split(" "))
    with module.CloudManager(
        auto_save=True,
        output="result",
    ) as cm:
        cm.set_text(input_)
        cm.set_stopwords(stopwords)
        cm.set_font("PretendardVariable.ttf")
        cm.set_max_words(100)
        return cm.make_wordcloud_base64()
