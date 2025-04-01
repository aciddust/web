import logging
import olefile
import zlib
import struct
import re
import unicodedata

from typing import Iterator

from dataclasses import dataclass

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

@dataclass
class Document:
    """문서 객체"""
    page_content: str
    metadata: dict

class HWPParser:
    """*.hwp parser"""
    def __init__(
        self,
        file_path: str | None = None,
        *args,
        **kwargs,
    ) -> None:
        super().__init__(*args, **kwargs)
        self.extra_info = {}
        self.file_path = file_path
        self._initialize_constants()

    def set_file_path(self, file_path: str) -> None:
        self.file_path = file_path

    def _initialize_constants(self) -> None:
        """initialize constants"""
        self.FILE_HEADER_SECTION = "FileHeader"
        self.HWP_SUMMARY_SECTION = "\x05HwpSummaryInformation"
        self.SECTION_NAME_LENGTH = len("Section")
        self.BODYTEXT_SECTION = "BodyText"
        self.HWP_TEXT_TAGS = [67]

    def lazy_load(self) -> Iterator[Document]:
        """HWP 파일에서 데이터를 로드하고 표를 추출합니다.

        Yields:
            Document: 추출된 문서
        """
        hwp_file = olefile.OleFileIO(self.file_path)
        dirs = hwp_file.listdir()
        logger.info('file_dir: %s', dirs)

        if not self._is_valid_hwp(dirs):
            raise ValueError("유효하지 않은 HWP 파일입니다.")

        result_text = self._extract_text(hwp_file, dirs)
        yield self._create_document(
            text=result_text,
            extra_info=self.extra_info,
        )

    def _is_valid_hwp(self, dirs: list[list[str]]) -> bool:
        """
        HWP 파일의 유효성을 검사합니다.

        `FileHeader`, `\x05HwpSummaryInformation` 섹션이 존재하는지 확인합니다.
        """

        return (
            [self.FILE_HEADER_SECTION] in dirs
            and [self.HWP_SUMMARY_SECTION] in dirs
        )

    def _get_body_sections(self, dirs: list[list[str]]) -> list[str]:
        """
        본문 섹션 목록을 반환합니다.

        0번째 인덱스에 BodyText가 포함된 섹션은 1번째 인덱스에 f'Section{num}' 형식 값이 존재함
        body section이 존재하는 경우, BodyText/Section{num} 형식으로 반환합니다.
        예시) BodyText/Section1, BodyText/Section2
        """
        section_numbers = [
            int(d[1][self.SECTION_NAME_LENGTH :])
            for d in dirs
            if d[0] == self.BODYTEXT_SECTION
        ]
        return [
            f"{self.BODYTEXT_SECTION}/Section{num}" for num in sorted(section_numbers)
        ]

    def _create_document(
        self, text: str, extra_info: dict | None = None
    ) -> Document:
        """문서 객체를 생성합니다."""
        return Document(page_content=text, metadata=extra_info or {})


    def _extract_text(
        self, hwp_file: olefile.OleFileIO, file_dir: list[list[str]]
    ) -> str:
        """모든 섹션에서 텍스트를 추출합니다."""
        sections = self._get_body_sections(file_dir)
        return "\n".join(
            self._get_text_from_section(hwp_file, section) for section in sections
        )

    def _is_compressed(self, hwp_file: olefile.OleFileIO) -> bool:
        """파일이 압축되었는지 확인합니다."""
        with hwp_file.openstream(self.FILE_HEADER_SECTION) as header:
            header_data = header.read()
            return bool(header_data[36] & 1)

    def _get_text_from_section(self, hwp_file: olefile.OleFileIO, section: str) -> str:
        """
        특정 섹션에서 텍스트를 추출합니다.

        BodyText/Section{num} 형식으로 섹션을 지정하여 레코드 정보를 읽어옵니다.
        압축된 경우 zlib로 압축 해제합니다.

        읽어온 레코드는 4바이트 단위로 읽어와야하며,
        레코드 헤더를 파싱하여 레코드 종류와 길이를 확인합니다.
        레코드 종류가 67인 경우 텍스트 데이터로 판단하여
        레코드 길이만큼 데이터를 읽어옵니다.
        읽어온 데이터는 2바이트 단위로 읽어와야하며,
        텍스트로 변환하여 반환합니다.
        """
        with hwp_file.openstream(section) as bodytext:
            logger.info('section: %s', section)
            data = bodytext.read()

        unpacked_data = (
            # 15, zlib header
            # 31: gzip header
            # -15: no header, raw deflate
            zlib.decompress(data, -15)
            if self._is_compressed(hwp_file)
            else data
        )

        text = []
        i = 0
        while i < len(unpacked_data):
            # 4바이트 단위로 헤더 파싱
            _header, rec_type, rec_len = self._parse_record_header(
                unpacked_data[i : i + 4]
            )
            logger.info('_header: %s, rec_type: %s, rec_len: %s', _header, rec_type, rec_len)
            # 텍스트 레코드인경우 텍스트를 추출
            if rec_type in self.HWP_TEXT_TAGS:
                # 레코드 길이만큼 데이터를 읽어옴 (레코드: 헤더 + 데이터)
                # 헤더 다음 영역은 데이터영역인데, 헤더가 가리키는 레코드 길이만큼 읽어와야함
                rec_data = unpacked_data[i + 4 : i + 4 + rec_len]
                # 바이너리 데이터는 2바이트 단위로 읽어와야함 (4.2.3 참조)
                text.append(rec_data.decode("utf-16"))
            # 다음 인덱스는 헤더 + 데이터 길이만큼 이동
            i += 4 + rec_len

        text = "\n".join(text)
        # 중국어, 컨트롤캐릭터 제거 후 텍스트 반환
        text = self.remove_chinese_characters(text)
        text = self.remove_control_characters(text)
        return text

    @staticmethod
    def remove_chinese_characters(s: str):
        """중국어 문자를 제거합니다."""
        return re.sub(r"[\u4e00-\u9fff]+", "", s)

    @staticmethod
    def remove_control_characters(s):
        """깨지는 문자 제거"""
        return "".join(ch for ch in s if unicodedata.category(ch)[0] != "C")

    @staticmethod
    def _parse_record_header(header_bytes: bytes) -> tuple:
        """
        레코드의 헤더를 파싱합니다.

        4.1 의 데이터 레코드 구조 확인
        """
        # <I: little-endian unsigned int
        # 4바이트 바이너리 데이터를 리틀 엔디안 방식으로 읽어서 32비트 unsigned 정수로 변환합니다.
        header = struct.unpack_from("<I", header_bytes)[0]

        # 하위 10비트만 추출, 0000 0011 1111 1111
        # 레코드 종류를 나타냄, 67인경우 텍스트데이터
        rec_type = header & 0x3FF

        # 상위 12비트만 추출
        # 20비트 오른쪽으로 시프트하고 하위 12비트 0000 1111 1111 1111 남김
        rec_len = (header >> 20) & 0xFFF
        return header, rec_type, rec_len
