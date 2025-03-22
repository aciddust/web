import { validateEchoToken } from "@/echo/services";
import type { RequestEvent } from '@sveltejs/kit';

export const GET = async ({ params, request }: RequestEvent): Promise<Response> => {
  try {
    // query param에 입력된 id를 가져온다.
    const chatId = params.id;
    const headers = request.headers;
    const token = headers.get('Authorization') || '';
    if (!chatId) {
      return new Response(JSON.stringify({ error: 'Invalid chat id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    const okay = validateEchoToken(chatId, token.replace('Bearer ', ''));
    if (!okay) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response(JSON.stringify({ exists: true }), {
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
