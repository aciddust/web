import { Groq } from 'groq-sdk';
import { GROQ_API_KEY } from '$env/static/private';
import {
  ASSISTANT_PROMPT_TYPE_A,
} from '../prompts';

import type { RequestEvent } from '@sveltejs/kit';


export const POST = async (event: RequestEvent): Promise<Response> => {
  const groq = new Groq({ apiKey: GROQ_API_KEY });

  const { text } = await event.request.json();
  if (!text) {
    return new Response(JSON.stringify({ error: 'No text provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  try{
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_completion_tokens: 1024,
      top_p: 0,
      temperature: 0,
      stop: null,
      stream: false,
      response_format: {
        "type": "json_object",
      },
      messages: [
        { role: "system", content: ASSISTANT_PROMPT_TYPE_A },
        { role: "user", content: text },
      ]
    })
    return new Response(JSON.stringify({
      success: true,
      response: JSON.parse(response.choices[0].message.content || '{}'),
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Out of quota' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
