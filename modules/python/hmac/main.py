from func import HMACHelper, logger

if __name__ == "__main__":
    KEY = "it's my secret"
    MESSAGE = "안녕하세요"

    hmac_helper = HMACHelper(KEY, "sha256")

    # HMAC 생성
    generated_hmac = hmac_helper.generate_hmac(MESSAGE)
    logger.info(f"Generated HMAC: {generated_hmac}")

    # HMAC 검증
    is_valid = hmac_helper.verify_hmac(MESSAGE, generated_hmac)
    logger.info(f"Is valid: {is_valid}")
