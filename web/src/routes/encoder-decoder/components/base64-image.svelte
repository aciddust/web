<script lang="ts">
  import { onMount } from 'svelte';
  import { Textarea } from '$lib/components/ui/textarea';
  import { writable, derived } from 'svelte/store';

  const exampleBase64Image = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvb2tpZS1pY29uIGx1Y2lkZS1jb29raWUiPjxwYXRoIGQ9Ik0xMiAyYTEwIDEwIDAgMSAwIDEwIDEwIDQgNCAwIDAgMS01LTUgNCA0IDAgMCAxLTUtNSIvPjxwYXRoIGQ9Ik04LjUgOC41di4wMSIvPjxwYXRoIGQ9Ik0xNiAxNS41di4wMSIvPjxwYXRoIGQ9Ik0xMiAxMnYuMDEiLz48cGF0aCBkPSJNMTEgMTd2LjAxIi8+PHBhdGggZD0iTTcgMTR2LjAxIi8+PC9zdmc+';
  const b64Image = writable('');

  // 유효한 data URL로 변환하는 derived store
  const b64ImagePreview = derived(b64Image, ($b64Image) => {
    if (!$b64Image.trim()) return '';

    // 이미 data: URL 형태인지 확인
    if ($b64Image.startsWith('data:image/')) {
      return $b64Image;
    }

    const originContent = $b64Image.trim()
    const base64Content = $b64Image.replace(/^data:image\/[^;]+;base64,/, '');
    try {
      atob(base64Content);
      return `${originContent}`;
    } catch (e) {
      // 유효하지 않은 base64인 경우 빈 문자열 반환
      return '';
    }
  });

  onMount(() => {
    b64Image.set(exampleBase64Image);
  });
</script>

<div class="flex flex-col justify-between space-y-2">
  <h2 class="text-xm font-bold">Decode Image</h2>
  <Textarea
    bind:value={$b64Image}
    placeholder="Paste your base64 encoded image here (with or without data:image prefix)"
    class="h-32"
    rows=4
  />

  <div class="flex flex-col justify-between space-y-4">
    <div class="flex justify-center">
      {#if $b64ImagePreview}
        <img
          src={$b64ImagePreview}
          alt=""
          class="max-h-96 max-w-full object-contain pt-4"
          on:error={() => {
            console.error('Failed to load image');
          }}
        />
      {:else}
        <p class="text-gray-500">
          No valid base64 image to display. Please paste a valid base64 encoded image in the textarea above.
        </p>
      {/if}
    </div>

    <div class="text-center text-sm text-gray-500">
      Paste your base64 encoded image in the textarea above to preview it.
      <br>
      Supports both raw base64 strings and complete data URLs.
    </div>
  </div>
</div>
