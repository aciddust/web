import type { Redis } from 'ioredis';
import redis from "$lib/server/redis"
import { URLPrefix } from '$lib/constants';

export const makeRandomString = (length: number) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const setUrl = async (url: string, shortenKey: string, expireDays: number) => {
  try {
    if (!redis) {
      return null
    }
    await redis?.ping();
    const metaKey = `${URLPrefix}:1:${url}`
    const resultKey = `${URLPrefix}:2:${shortenKey}`
    const pipeline = redis.pipeline();
    pipeline.set(resultKey, url, "EX", expireDays * 24 * 60 * 60);
    pipeline.set(metaKey, shortenKey, "EX", expireDays * 24 * 60 * 60);
    await pipeline.exec();
  } catch (e) {
    console.error("Redis error: ", e);
    return null
  }
}

export const getUrl = async (shortenKey: string, expireDays: number) => {
  try {
    if (!redis) {
      return null
    }
    await redis?.ping();

    const resultKey = `${URLPrefix}:2:${shortenKey}`
    const originUrl = await redis.get(resultKey)
    if (!originUrl) {
      const metaKey = `${URLPrefix}:1:${originUrl}`
      await redis.del(metaKey)
      return null
    } else {
      // 오늘로부터 30일 이후로 만료기간 설정
      const metaKey = `${URLPrefix}:1:${originUrl}`
      const pipeline = redis.pipeline();
      pipeline.expire(metaKey, expireDays * 24 * 60 * 60);
      pipeline.expire(resultKey, expireDays * 24 * 60 * 60);
      await pipeline.exec();
      return originUrl
    }
  } catch (e) {
    console.error("Redis error: ", e);
    return null
  }
}
