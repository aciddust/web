import { Groq } from 'groq-sdk';
import { GROQ_API_KEY } from '$env/static/private';
import {
  ASSISTANT_PROMPT_TYPE_C,
  ASSISTANT_PROMPT_TYPE_B_PHASE_2,
  ALLOWED_CATEGORIES,
} from '../prompts';

import type { RequestEvent } from '@sveltejs/kit';

function filterCategories(categories: string[]) {
  const allowed: string[] = [];
  const notAllowed: string[] = [];

  categories.forEach(category => {
    if (ALLOWED_CATEGORIES.includes(category)) {
      allowed.push(category);
    } else {
      notAllowed.push(category);
    }
  });
  return { allowed, notAllowed };
}

export const GET = async (event: RequestEvent): Promise<Response> => {
  const categories = [
    "직업능력개발",
    "어학능력개발",
    "취미생활강좌"
  ]
  const { allowed, notAllowed } = filterCategories(categories);
  return new Response(JSON.stringify({
      success: true,
      allowed,
      notAllowed,
      message: 'Hello from GET'
    }), {
    headers: { 'Content-Type': 'application/json' }
  });
};

export const POST = async (event: RequestEvent): Promise<Response> => {
  const groq = new Groq({ apiKey: GROQ_API_KEY });

  const { text } = await event.request.json();
  if (!text) {
    return new Response(JSON.stringify({ error: 'No text provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  try {
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
        { role: "system", content: ASSISTANT_PROMPT_TYPE_C },
        { role: "user", content: text },
      ]
    })
    const phase1Json = JSON.parse(response.choices[0].message.content || '{}')
    console.log('phase 1 response: ', phase1Json)
    const phase1Fields = phase1Json.positions || []
    console.log('phase 2 begin')
    const phase2Response = await groq.chat.completions.create({
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
        { role: "system", content: ASSISTANT_PROMPT_TYPE_B_PHASE_2 },
        { role: "user", content: `${phase1Fields.join(',')}` },
      ]
    })
    const phase2Json = JSON.parse(phase2Response.choices[0].message.content || '{}')
    console.log('phase 2 response: ', phase2Json)
    const newCategories = phase2Json.categories || []
    const uniqueCategories = new Set([...newCategories])
    const uniqueCategoriesArray = Array.from(uniqueCategories)
    return new Response(JSON.stringify({
      success: true,
      response: {
        ...phase1Json,
        fields: uniqueCategoriesArray,
      },
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    console.error('Out of quota', e);
    return new Response(JSON.stringify({ error: 'Out of quota' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
