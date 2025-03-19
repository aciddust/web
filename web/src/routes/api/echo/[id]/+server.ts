import redis from "$lib/server/redis"
import {
  validateEchoToken,
  destroyChat,
  sendMessage,
  messageType,
  getMessages,
} from '@/echo/services';
import type { RequestEvent } from '@sveltejs/kit';


export const GET = async ({ params, request, url } : RequestEvent): Promise<Response> => {
  const id = params.id;
  const headers = request.headers;
  const begin = url.searchParams.get("begin") ?? "-";

  if (!id) {
    return new Response(JSON.stringify({ error: 'Invalid chat id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const token = headers.get('Authorization');
  if (!token) {
    return new Response(JSON.stringify({ error: 'Authorization required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  const bearerToken = token.replace('Bearer ', '');
  if (!validateEchoToken(id, bearerToken)) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const messages = await getMessages(id, begin);
    return new Response(JSON.stringify(messages), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to get messages' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

}

export const POST = async ({ params, request } : RequestEvent): Promise<Response> => {
  // get body and header
  const id = params.id;
  const body = await request.json();
  const headers = request.headers;

  const token = headers.get('Authorization');
  if (!token) {
    return new Response(JSON.stringify({ error: 'Authorization required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!id) {
    return new Response(JSON.stringify({ error: 'Invalid chat id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const message = {
    text: JSON.stringify(body),
    type: messageType.JSON,
    chatId: id,
    ts: Date.now(),
  }

  try {
    const sent = await sendMessage(message);
    if (!sent) {
      return new Response(JSON.stringify({ error: 'Failed to send message' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to send message' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}


export const DELETE = async ({ params, request } : RequestEvent): Promise<Response> => {
  const id = params.id;
  const headers = request.headers;

  if (!id) {
    return new Response(JSON.stringify({ error: 'Invalid chat id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const token = headers.get('Authorization');
  if (!token) {
    return new Response(JSON.stringify({ error: 'Authorization required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  const bearerToken = token.replace('Bearer ', '');
  if (!validateEchoToken(id, bearerToken)) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    await destroyChat(id);
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to destroy echo room' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}