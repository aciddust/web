import { REDIS_HOST, REDIS_PORT, REDIS_USERNAME, REDIS_PASSWORD } from "$env/static/private"
import Redis from "ioredis";

let redis: Redis | null = null;

if (!redis) {
  redis = new Redis({
    host: REDIS_HOST,
    port: parseInt(REDIS_PORT),
    username: REDIS_USERNAME,
    password: REDIS_PASSWORD,
    maxRetriesPerRequest: null, // 자동 재시도 활성화
    enableAutoPipelining: true, // 여러 요청 한번에 보내기
    lazyConnect: true, // 필요할 때만 연결
    keepAlive: 10000, // 10초마다 keep-alive 패킷 보내기
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

  redis.on("error", (err) => {
    console.error("Redis error: ", err);
  });
}

export default redis;
