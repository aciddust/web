import { SUPABASE_URL, SUPABASE_PASSWORD } from '$env/static/private';
import type { RequestEvent } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';



export const POST = async ({ params, request } : RequestEvent): Promise<Response> => {
  const id = params.id;
  const supabase = createClient(SUPABASE_URL, SUPABASE_PASSWORD);
  const channel = supabase.channel(`chat#${id}`);
  const body = await request.json();

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
