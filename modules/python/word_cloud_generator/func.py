import base64
from datetime import datetime

import numpy as np
from PIL import Image
from wordcloud import STOPWORDS, WordCloud


class CloudManager:
    def __init__(
        self,
        max_words: int = 100,
        bgcolor: str = "white",
        auto_save: bool = False,
        output: str | None = None,
        width: int = 800,
        height: int = 800,
    ) -> None:
        self.mask: np.ndarray
        self.text: str
        self.font_path: str
        self.stopwords: set[str]
        self.wc: WordCloud
        self.max_words = max_words
        self.bgcolor = bgcolor
        self.auto_save = auto_save
        self.output = output
        self.width = width
        self.height = height

    def __enter__(self):
        self.initialize()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.auto_save:
            datetime_now_str = datetime.now().strftime("%Y%m%d-%H%M%S")
            if self.output:
                self.make_wordcloud().to_file(f"{self.output}.png")
            else:
                self.make_wordcloud().to_file(f"wordcloud-{datetime_now_str}.png")

    def initialize(self) -> None: ...

    def set_mask(self, mask_path: str) -> None:
        self.mask = np.array(Image.open(mask_path))

    def set_text_by_file(self, txt_path: str) -> None:
        with open(txt_path, "r", encoding="utf-8") as f:
            self.text = f.read()

    def set_text(self, txt: str) -> None:
        self.text = txt

    def set_stopwords_by_file(self, stopwords_path: str) -> None:
        with open(stopwords_path, "r", encoding="utf-8") as f:
            stopwords = f.read().split("\n")
        self.stopwords = set(STOPWORDS)
        self.stopwords.union(set(stopwords))

    def set_stopwords(self, stopwords: list[str]) -> None:
        self.stopwords = set(STOPWORDS)
        self.stopwords.union(set(stopwords))

    def set_bgcolor(self, bgcolor: str) -> None:
        self.bgcolor = bgcolor

    def set_max_words(self, max_words: int) -> None:
        self.max_words = max_words

    def set_font(self, font_path: str) -> None:
        self.font_path = font_path

    def add_stopwords(self, stopwords: set[str]) -> None:
        self.stopwords.union(stopwords)

    def make_wordcloud(self) -> WordCloud:
        self.wc = WordCloud(
            max_words=self.max_words,
            font_path=self.font_path,
            stopwords=self.stopwords,
            background_color=self.bgcolor,
            width=self.width,
            height=self.height,
            # mask=self.mask,
        ).generate(self.text)
        return self.wc

    def make_wordcloud_image(self):
        image = self.make_wordcloud().to_image()
        return image

    def make_wordcloud_bytes(self):
        image = self.make_wordcloud().to_image()
        image_bytes = image.tobytes()
        return image_bytes

    def make_wordcloud_ndarray(self):
        ndarray = self.make_wordcloud().to_array()
        return ndarray

    def make_wordcloud_base64(self):
        image = self.make_wordcloud().to_image()
        image_bytes = image.tobytes()
        base64_str = base64.b64encode(image_bytes).decode("utf-8")
        return base64_str
