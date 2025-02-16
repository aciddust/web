import { error } from '@sveltejs/kit';
import { get } from 'svelte/store';

import { getAllMarkdownFiles } from '$lib/blog/retrievePostList';

import {
  postListByCategory,
} from '$lib/blog/store';

export async function load() {
  try {
    // store에 데이터가 있는지 확인
    const storeData = get(postListByCategory);

    if (Object.keys(storeData).length > 0) {
      // store에 데이터가 있으면 store의 데이터 사용
      return {
        status: 200,
        body: storeData
      };
    } else {
      // store에 데이터가 없으면 GitHub API 호출
      const newPostListByCategory = await getAllMarkdownFiles();
      console.log(newPostListByCategory);
      console.log("no data in store, fetching from GitHub API");
      // store 업데이트
      postListByCategory.set(newPostListByCategory);
      return {
        status: 200,
        body: newPostListByCategory
      };
    }
  } catch (err) {
    console.error('Error:', err);
    throw error(500, '포스트 목록을 가져오는 중 오류가 발생했습니다.');
  }
}
