import { Groq } from 'groq-sdk';
import { GROQ_API_KEY } from '$env/static/private';
import { ASSISTANT_PROMPT } from './prompts';

import type { RequestEvent } from '@sveltejs/kit';


export const POST = async (event: RequestEvent): Promise<Response> => {
  const groq = new Groq({ apiKey: GROQ_API_KEY });

  try {
    const { text } = await event.request.json();
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
    return new Response(JSON.stringify({ error: 'Failed to send message' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
