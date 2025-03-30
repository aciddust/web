import { Groq } from 'groq-sdk';
import { GROQ_API_KEY } from '$env/static/private';
import {
  ASSISTANT_PROMPT_TYPE_A,
  ASSISTANT_PROMPT_TYPE_B,
} from '../prompts';

import type { RequestEvent } from '@sveltejs/kit';


export const POST = async (event: RequestEvent): Promise<Response> => {
  const groq = new Groq({ apiKey: GROQ_API_KEY });

  try {
    const { text, type } = await event.request.json();
    if (!text) {
      return new Response(JSON.stringify({ error: 'No text provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    if (!type) {
      return new Response(JSON.stringify({ error: 'No version provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    const ASSISTANT_PROMPT = type === 'A' ? ASSISTANT_PROMPT_TYPE_A : ASSISTANT_PROMPT_TYPE_B;
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 1,
      max_completion_tokens: 1024,
      top_p: 1,
      stop: null,
      stream: false,
      response_format: {
        "type": "json_object",
      },
      messages: [
        { role: "system", content: ASSISTANT_PROMPT },
        { role: "user", content: text },
      ]
    })

    return new Response(JSON.stringify({
      success: true,
      response: JSON.parse(response.choices[0].message.content || '{}'),
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  catch (error) {
    console.log(error)
    return new Response(JSON.stringify({ error: 'Failed to send message' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
