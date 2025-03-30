import { Groq } from 'groq-sdk';
import { GROQ_API_KEY } from '$env/static/private';
import {
  ASSISTANT_PROMPT_TYPE_B,
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
        { role: "system", content: ASSISTANT_PROMPT_TYPE_B },
        { role: "user", content: text },
      ]
    })
    const phase1Json = JSON.parse(response.choices[0].message.content || '{}')
    console.log('phase 1 response: ', phase1Json)
    const phase1Fields = phase1Json.fields || []
    const {allowed, notAllowed} = filterCategories(phase1Fields)
    console.log('allowed: ', allowed)
    console.log('notAllowed: ', notAllowed)
    if (notAllowed.length < 1) {
      return new Response(JSON.stringify({
        success: true,
        response: JSON.parse(response.choices[0].message.content || '{}'),
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    console.log('phase 2 begin')
    // phase_1 의 fields에 ALLOWED_CATEGORIES에 포함되지 않은 category가 있으면 한번 더 요청
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
        { role: "user", content: `${notAllowed.join(',')}` },
      ]
    })
    const phase2Json = JSON.parse(phase2Response.choices[0].message.content || '{}')
    console.log('phase 2 response: ', phase2Json)
    const newCategories = phase2Json.categories || []
    console.log('validCategories: ', allowed)
    console.log('phase 2 fields: ', newCategories)
    // allowed + newCategories, 대신 중복은 제거
    const uniqueCategories = new Set([...allowed, ...newCategories])
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
