import { keyExists, createEchoToken, setKey } from "@/echo/services";
import type { RequestEvent } from '@sveltejs/kit';

export const GET = async ({ params }: RequestEvent): Promise<Response> => {
  try {
    // query param에 입력된 id를 가져온다.
    const chatId = params.id;
    if (!chatId) {
      return new Response(JSON.stringify({ error: 'Invalid chat id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    const exists = await keyExists(chatId);
    if (exists === null) {
      return new Response(JSON.stringify({ error: 'error try later' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    if (exists) {
      return new Response(JSON.stringify({ exists: true }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    await setKey(chatId);
    return new Response(JSON.stringify({
      exists: false,
      token: createEchoToken(chatId, 10),
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'error try later' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

