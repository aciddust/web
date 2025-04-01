import { error } from '@sveltejs/kit';
import type {
  PostFromGithub,
  PostListByCategory,
} from '$lib/blog/types';

import {
  get,
} from 'svelte/store';

import {
  GITHUB_API_TOKEN,
  GITHUB_API_BASE,
  GITHUB_USER,
  GITHUB_REPO,
  GITHUB_BRANCH,
  GITHUB_POSTS_PATH,
} from '$env/static/private';

import {
  postById,
  postListByCategory
} from '$lib/blog/store';


export async function getAllMarkdownFiles(): Promise<PostListByCategory> {
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${GITHUB_USER}/${GITHUB_REPO}/git/trees/${GITHUB_BRANCH || 'main'}?recursive=1`,
    {
      headers: {
        Authorization: `Bearer ${GITHUB_API_TOKEN}`,
        Accept: 'application/vnd.github.v3+json'
      }
    }
  );

  if (!response.ok) {
    throw error(404, '파일 목록을 가져올 수 없습니다.');
  }

  const { tree } = await response.json();

  // "posts/" 아래 모든 마크다운 파일 필터링 및 파일명에서 date, time, title 추출
  const postList: PostFromGithub[] = tree
    .filter((item: any) => item.path.startsWith(GITHUB_POSTS_PATH) && item.path.endsWith('.md'))
    .map((item: any) => {
      const category = item.path.split('/')[1];
      const filename = item.path.split('/').pop()!;
      // 파일명 형식: ${postId}-${date}-${time}-${title}.md
      const baseName = filename.slice(0, -3); // .md 제거
      const parts = baseName.split('-');
      // parts[0]: postId, parts[1]: yyyymmdd, parts[2]: hhmm, parts[3...]: title parts
      const postId = parts[0];
      const year = parts[1].substring(0, 4);
      const month = parts[1].substring(4, 6);
      const day = parts[1].substring(6, 8);
      const hour = parts[2].substring(0, 2);
      const minute = parts[2].substring(2, 4);
      const dateString = `${year}-${month}-${day}T${hour}:${minute}:00`;
      const date = new Date(dateString);
      const title = parts.slice(3).join('-'); // 나머지 부분이 title
      return {
        postId,
        date,
        title,
        category,
        path: item.path,
        sha: item.sha,
        url: `${GITHUB_API_BASE}/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${item.path}`,
        download_url: `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/${item.path}`,
        type: item.type
      };
    });

  // 카테고리별로 정리
  const newPostListByCategory: PostListByCategory = {};

  postList.forEach((post) => {
    // posts/category/file.md 형식에서 카테고리 추출
    const pathParts = post.path.split('/');
    let category = 'uncategorized';

    // posts 디렉토리 이후의 경로에서 카테고리 확인
    if (pathParts.length > 2) {
      category = pathParts[1];  // posts 다음 경로를 카테고리로 사용
    }

    // 카테고리가 없으면 초기화
    if (!newPostListByCategory[category]) {
      newPostListByCategory[category] = {
        total: 0,
        posts: []
      };
    }

    // 해당 카테고리에 포스트 추가
    newPostListByCategory[category].posts.push(post);
    newPostListByCategory[category].total = newPostListByCategory[category].posts.length;
  });
  // 각 카테고리의 포스트를 날짜 기준으로 정렬
  Object.keys(newPostListByCategory).forEach(category => {
    newPostListByCategory[category].posts.sort((a, b) => {
      if (a.date === b.date) return 0;
      if (a.date === null) return 1;
      if (b.date === null) return -1;
      if (a.date === null && b.date === null) return 0;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    newPostListByCategory[category].total = newPostListByCategory[category].posts.length;
  });

  // id별로 정리
  postList.forEach((post) => {
    postById.update((value) => {
      value[post.postId] = post;
      return value;
    });
  });

  return newPostListByCategory;
}


export async function getMarkdownFromGithub(postId: string): Promise<string> {
  let postMetadata: PostFromGithub = get(postById)[postId];

  if (!postMetadata) {
    postListByCategory.set(await getAllMarkdownFiles());
    postMetadata = get(postById)[postId];
  }

  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${postMetadata.path}?ref=${GITHUB_BRANCH}`,
    {
      headers: {
        Authorization: `Bearer ${GITHUB_API_TOKEN}`,
        Accept: 'application/vnd.github.v3+json'
      }
    }
  );

  if (!response.ok) {
    throw error(404, '파일 다운로드 링크를 가져올 수 없습니다.');
  }

  const { download_url } = await response.json();
  const markdownResponse = await fetch(download_url);
  if (markdownResponse.ok) {
    const result = await markdownResponse.text();
    return result
  }
  return ''; // FIXME: no content page
}
