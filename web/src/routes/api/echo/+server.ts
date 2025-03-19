import redis from "$lib/server/redis"
import { chatExists, createEchoToken, createChat } from "@/echo/services";
import type { RequestEvent } from '@sveltejs/kit';


export const POST = async (event: RequestEvent): Promise<Response> => {
  try {
    const body = await event.request.json();
    const { id } = body;
    if (!id) {
      return new Response(JSON.stringify({ error: 'Invalid chat id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    if (await chatExists(id)) {
      return new Response(JSON.stringify({ error: 'Chat already exists' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    const created = await createChat(id);
    if (!created) {
      return new Response(JSON.stringify({ error: 'Failed to create chat' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response(JSON.stringify({
      success: true,
      token: createEchoToken(body.id, 10)
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to send message' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
