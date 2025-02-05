import logging

from func import CloudManager

logging.basicConfig(level=logging.INFO)

TXT_PATH = "lorem-ipsum.txt"
STOPWORDS_PATH = "stopwords.txt"
FONT_PATH = "PretendardVariable.ttf"
BACKGROUND_COLOR = "white"
MAX_WORDS = 100


def main():
    with open(TXT_PATH, "r", encoding="utf-8") as f:
        text = f.read()
    with open(STOPWORDS_PATH, "r", encoding="utf-8") as f:
        stopwords = f.read().split("\n")
    with CloudManager(auto_save=True, output="result") as cm:
        cm.set_text(text)
        cm.set_stopwords(stopwords)
        cm.set_bgcolor(BACKGROUND_COLOR)
        cm.set_max_words(MAX_WORDS)
        cm.set_font(FONT_PATH)


if __name__ == "__main__":
    main()