<script lang="ts">
  import { onMount } from 'svelte';
  import { Skeleton } from '$lib/components/ui/skeleton';
  import Base64 from './components/base64.svelte';
  import URL from './components/url.svelte';

  let loading = true;

  onMount(async () => {
    loading = false;
  });
</script>

{#if loading}
  <Skeleton class="h-4 w-1/4" />
  <br>
  <Skeleton class="h-4 w-1/5" />
  <br>
  <Skeleton class="h-4 w-1/6" />
  <Skeleton class="h-48 w-full" />
{:else}
  <div class="flex flex-col space-y-4">
    <div class="flex flex-col space-y-2">
      <h1 class="text-2xl font-bold">Encoder Decoder</h1>
    </div>
    <Base64 />
    <URL />
  </div>
{/if}