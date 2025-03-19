import { chatExists } from "@/echo/services";
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
    const exists = await chatExists(chatId);
    if (exists === null) {
      return new Response(JSON.stringify({ error: 'error try later' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    if (!exists) {
      return new Response(JSON.stringify({ exists: false }), {
        status: 404,
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
