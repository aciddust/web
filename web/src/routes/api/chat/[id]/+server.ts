import {
  validateEchoToken,
  destroyChat,
  messageType,
} from '@/echo/services';
import { SUPABASE_URL, SUPABASE_PASSWORD } from '$env/static/private';
import type { RequestEvent } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';



export const POST = async ({ params, request } : RequestEvent): Promise<Response> => {
  const id = params.id;
  const supabase = createClient(SUPABASE_URL, SUPABASE_PASSWORD);
  const channel = supabase.channel(`chat#${id}`);
  const body = await request.json();
  const headers = request.headers;

  const token = headers.get('Authorization');
  if (!token) {
    return new Response(JSON.stringify({ error: 'Authorization required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const tokenPart = token.split('Bearer ')[1];
  if (!validateEchoToken(id || "", tokenPart)) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const message = JSON.stringify(body);

  try {
    channel?.send({
      type: 'broadcast',
      event: 'message',
      payload: {
        timestamp: new Date().toISOString(),
        message: message,
        type: "json",
      }
    })
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