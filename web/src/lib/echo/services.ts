import redis from "$lib/server/redis"
import jwt from "jsonwebtoken";
import { ECHO_APP_KEY } from "$env/static/private";

const TOKEN_EXPIRE_MINUTES = 10

const mangleChatKey = (id: string) => {
  return `chat:echo:${id}`
}

export const messageType = {
  TEXT: "text",
  JSON: "json",
}

interface JWTToken {
  id: string
  exp: number
}

export interface MessageIn {
  text: string
  type: string
  chatId: string
  ts: number
}

export const validateEchoToken = (id: string, token: string) => {
  try {
    const decoded = jwt.verify(token, ECHO_APP_KEY) as JWTToken
    if (decoded.id !== id) {
      return false
    }
    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      return false
    }
    return true
  }
  catch (error) {
    console.log("JWT error: ", error);
    return false
  }
}

export const createEchoToken = (id: string, minutes: number) => {
  // access token
  if (minutes > TOKEN_EXPIRE_MINUTES) {
    return null
  }
  try {
    const token = jwt.sign({
      id,
      exp: Math.floor(Date.now() / 1000) + (60 * minutes)
    }, ECHO_APP_KEY);
    return token
  } catch (error) {
    console.error("JWT error: ", error);
    return null
  }
}

export const createChat = async (id: string) => {
  // 만료시간이 존재하는 스트림 생성
  try {
    if (!redis) {
      return null
    }
    await redis?.ping();
    const key = mangleChatKey(id)
    await redis.xadd(
      key, "MAXLEN", "~", 10, "*", "message", JSON.stringify({ type: "text", text: "Hello", ts: Date.now() }),
    );
    // token expire minutes + 1분 만큼 만료시간 설정
    await redis.expire(key, 60 * (TOKEN_EXPIRE_MINUTES + 1));
    return true
  } catch (error) {
    console.error("Redis error: ", error);
    return false
  }
}

export const chatExists = async (id: string) => {
  try {
    if (!redis) {
      return null
    }
    await redis?.ping();
    const key = mangleChatKey(id)
    const exists = await redis.exists(key);
    if (exists) {
      return true
    }
    return false
  } catch (error) {
    console.error("Redis error: ", error);
    return null
  }
}

export const sendMessage = async (message: MessageIn) => {
  try {
    if (!redis) {
      return null
    }
    await redis?.ping();
    const key = mangleChatKey(message.chatId)
    await redis.xadd(
      key, "*",
      "message", JSON.stringify(message),
    );
    return true
  } catch (error) {
    console.error("Redis error: ", error);
    return false
  }
}

export const getMessages = async (chatId: string, begin: string, end: string="+") => {
  try {
    if (!redis) {
      return null
    }
    await redis?.ping();
    const key = mangleChatKey(chatId)
    const messages = await redis.xrange(key, begin, end);
    return messages
  } catch (error) {
    console.error("Redis error: ", error);
    return null
  }
}

export const destroyChat = async (id: string) => {
  try {
    if (!redis) {
      return null
    }
    await redis?.ping();
    const key = mangleChatKey(id)
    await redis.del(key);
    return true
  } catch (error) {
    console.error("Redis error: ", error);
    return false
  }
}
