<script>
	import { routeToPage } from "$lib/utils";
  export let post;
  export let categoryQuery
</script>

<button
  type="button"
  on:click|preventDefault={() => routeToPage(`blog/${post.postId}`)}
  class="block p-4 border rounded-lg hover:border-blue-500 transition-colors duration-200"
>
  <div class="flex justify-between items-center mb-2">
    <h3 class="text-xl font-semibold">{post.title}</h3>
    {#if categoryQuery === post.category}
      <!-- pass -->
    {:else}
      <span class="text-gray-500 text-sm">{post.category}</span>
    {/if}
  </div>
  <div class="flex justify-between mb-2">
    <p class="text-gray-500 text-sm">
      {#if post.date}
    {new Date(post.date).toISOString().slice(0,16).replace('T',' ')}
      {:else}
    N/A
      {/if}
    </p>
  </div>
</button>