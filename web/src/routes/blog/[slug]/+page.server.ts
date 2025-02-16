import { error } from '@sveltejs/kit';

import {
  getMarkdownFromGithub,
} from '$lib/blog/retrievePostList';


export async function load({ params }) {
  try {
    const { slug } = params; // <-- slug is the post ID
    return {
      props: {
        content: await getMarkdownFromGithub(slug),
      },
    };
  } catch (err) {
    console.error('Error:', err);
    throw error(500, '포스트 정보를 가져오는 중 오류가 발생했습니다.');
  }
}
