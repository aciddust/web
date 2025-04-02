<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import type { PostFromGithub, PostListByCategory } from '$lib/blog/types';
	import PostCard from './components/postCard.svelte';

  export let data
  const status: number = data.status
  const postListByCategory: PostListByCategory = data.body
  const POSTS_PER_PAGE = 10;

  const getTotalPostCount = () => {
    let count = 0;
    for (const category in postListByCategory) {
      count += postListByCategory[category].total;
    }
    return count;
  };

  const originTotalPostCount: number = getTotalPostCount();

  $: currentCategory = $page.url.searchParams.get('category') || 'all';
  $: currentPage = parseInt($page.url.searchParams.get('page') || '1');

  $: filteredPostList = () => {
    let posts: PostFromGithub[] = [];

    if (currentCategory === 'all') {
      // 전체 포스트
      for (const category in postListByCategory) {
        posts.push(...postListByCategory[category].posts);
      }
    } else if (postListByCategory[currentCategory]) {
      // 특정 카테고리 포스트
      posts = [...postListByCategory[currentCategory].posts];
    }

    // 날짜순 정렬
    return posts.sort((a, b) => {
      if (a.date === b.date) return 0;
      if (a.date === null) return 1;
      if (b.date === null) return -1;
      if (a.date === null && b.date === null) return 0;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  };
  $: filteredPosts = filteredPostList();
  $: totalPostCount = filteredPosts.length;
  $: totalPages = Math.ceil(totalPostCount / POSTS_PER_PAGE);
  $: currentPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  const navigateToPage = async (pageNumber: number) => {
    if (! browser) return;
    const url = new URL(window.location.href);
    url.searchParams.set('page', pageNumber.toString());
    await goto(url.toString(), { keepFocus: true });
  }

  const selectCategory = async (category: string) => {
    if (!browser) return;
    const url = new URL(window.location.href);
    url.searchParams.set('category', category);
    url.searchParams.set('page', '1');
    await goto(url.toString(), {
      keepFocus: true,
      invalidateAll: true  // 모든 데이터 갱신
    });
  };
</script>

{#if status !== 200}
  <div class="bg-transparent w-full flex flex-col justify-center items-center text-center max-h-[80vh]">
    <h1 class="text-4xl font-bold">Error {status}</h1>
    <p class="text-lg">Something went wrong</p>
  </div>
{:else}
<div class="max-w-4xl mx-auto py-2">
  <div class="sticky top-0 z-10 bg-white pt-4">
    <div class="flex space-x-1 px-2 pb-1">
      <button
        class="relative px-6 py-2 rounded-t-lg font-semibold transition-all {
          currentCategory === 'all' 
            ? 'bg-blue-500 text-white shadow-lg translate-y-0' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700 translate-y-1'
        }"
        on:click={() => selectCategory('all')}
      >
        Total
        <span class="ml-1 text-xs {currentCategory === 'all' ? 'text-blue-100' : 'text-gray-500'}">
          ({originTotalPostCount})
        </span>
        {#if currentCategory === 'all'}
          <span class="absolute bottom-0 left-0 w-full h-1 bg-blue-500"></span>
        {/if}
      </button>
      {#each Object.entries(postListByCategory) as [category, { total }]}
        <button
          class="relative px-6 py-2 rounded-t-lg font-semibold transition-all {
            currentCategory === category 
              ? 'bg-blue-500 text-white shadow-lg translate-y-0' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700 translate-y-1'
          }"
          on:click={() => selectCategory(category)}
        >
          {category}
          <span class="ml-1 text-xs {currentCategory === category ? 'text-blue-100' : 'text-gray-500'}">
            ({total})
          </span>
          {#if currentCategory === category}
            <span class="absolute bottom-0 left-0 w-full h-1 bg-blue-500"></span>
          {/if}
        </button>
      {/each}
    </div>
  </div>

  {#if totalPostCount === 0}
    <div class="bg-transparent w-full flex flex-col justify-center items-center text-center max-h-[80vh]">
      <h1 class="text-4xl font-bold">No Posts</h1>
      <p class="text-lg">There are no posts yet</p>
    </div>
  {:else}
    <!-- 첫 페이지에는 최근 10개 포스트만 표시 -->
    <div class="grid grid-cols-1 gap-4 mb-8">
      {#each currentPosts as post}
        <PostCard post={post} categoryQuery={currentCategory}  />
      {/each}
    </div>

    <!-- 페이지네이션 네비게이터 -->
    <div class="flex justify-center items-center space-x-2 py-4">
      {#if currentPage > 1}
        <button
          on:click={() => navigateToPage(currentPage - 1)}
          class="px-4 py-2 border rounded hover:bg-gray-100"
        >
          이전
        </button>
      {/if}

      {#each Array(Math.min(5, totalPages)) as _, i}
        {@const pageNum = currentPage - 2 + i}
        {#if pageNum > 0 && pageNum <= totalPages}
          <button
            class="px-4 py-2 border rounded {pageNum === currentPage ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}"
            on:click={() => navigateToPage(pageNum)}
          >
            {pageNum}
          </button>
        {/if}
      {/each}

      {#if currentPage < totalPages}
        <button
          on:click={() => navigateToPage(currentPage + 1)}
          class="px-4 py-2 border rounded hover:bg-gray-100"
        >
          다음
        </button>
      {/if}
    </div>
  {/if}
  </div>
{/if}
