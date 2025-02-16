import type {
  PostFromGithub,
  PostListByCategory
} from '$lib/blog/types';

import { writable } from 'svelte/store';

export const postListByCategory = writable<PostListByCategory>({});
export const postById = writable<{ [key: string]: PostFromGithub }>({});

export const currentPage = writable<number>(1);
