import logging
import hashlib
from time import time

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
logger.addHandler(logging.StreamHandler())

class HMACBase:
    def hmac_digest(self, key: bytes, message: bytes) -> bytes:
        raise NotImplementedError


class SHA256(HMACBase):
    def hmac_digest(self, key: bytes, message: bytes) -> bytes:
        BLOCK_SIZE = 64
        OPAD = bytes([0x5c] * BLOCK_SIZE)
        IPAD = bytes([0x36] * BLOCK_SIZE)

        if len(key) > BLOCK_SIZE:
            key = hashlib.sha256(key).digest()

        key = key.ljust(BLOCK_SIZE, b'\x00')

        inner_hash = hashlib.sha256(bytes([
            k ^ i for k, i in zip(key, IPAD)
        ]) + message).digest()
        outer_hash = hashlib.sha256(bytes([
            k ^ o for k, o in zip(key, OPAD)
        ]) + inner_hash).digest()

        return outer_hash


class MD5(HMACBase):
    def hmac_digest(self, key: bytes, message: bytes) -> bytes:
        BLOCK_SIZE = 64
        OPAD = bytes([0x5c] * BLOCK_SIZE)
        IPAD = bytes([0x36] * BLOCK_SIZE)

        if len(key) > BLOCK_SIZE:
            key = hashlib.md5(key).digest()

        key = key.ljust(BLOCK_SIZE, b'\x00')

        inner_hash = hashlib.md5(bytes([
            k ^ i for k, i in zip(key, IPAD)
        ]) + message).digest()
        outer_hash = hashlib.md5(bytes([
            k ^ o for k, o in zip(key, OPAD)
        ]) + inner_hash).digest()

        return outer_hash

class HMACHelper:
    def __init__(self, key: str, digestmod:str="sha256"):
        self.key = key.encode()
        self.digestmod = self._get_hmac_class(digestmod)()

    def _get_hmac_class(self, digestmod: str) -> type[HMACBase]:
        hmac_classes = {
            "sha256": SHA256,
            "md5": MD5
        }
        if digestmod not in hmac_classes:
            raise ValueError(f"Unsupported digest mode: {digestmod}")
        return hmac_classes[digestmod]

    def generate_hmac(self, message: str) -> str:
        """ 메시지에 대한 HMAC을 생성 """
        digest = self.digestmod.hmac_digest(self.key, message.encode())
        return digest.hex()


    def compare_digest(self, a: bytes, b: bytes) -> bool:
        if len(a) != len(b):
            return False

        # case 2, int.from_bytes() 사용
        return int.from_bytes(a, "big") ^ int.from_bytes(b, "big") == 0

    def verify_hmac(self, message: str, expected_hmac: str) -> bool:
        """ 메시지에 대한 HMAC을 생성하고, 주어진 HMAC 값과 비교하여 검증 """
        generated_hmac = self.generate_hmac(message)
        return self.compare_digest(generated_hmac.encode(), expected_hmac.encode())
