<script lang="ts">
  import { Textarea } from "$lib/components/ui/textarea";
  import { writable, derived } from 'svelte/store';
  import DiffMatchPatch from 'diff-match-patch';

  const text1 = writable('');
  const text2 = writable('');

  const dmp = new DiffMatchPatch();

  const diffResult = derived([text1, text2], ([$text1, $text2]) => {
    const diff = dmp.diff_main($text1, $text2);
    dmp.diff_cleanupSemantic(diff);
    return diff.map(([type, text]) => ({
      type,
      text,
      classMetadata: type === -1 ? 'bg-red-200' :
            type === 1 ? 'bg-green-200' : ''
    }));
  });
</script>

<div class="flex flex-col space-y-4">
  <div class="flex flex-col space-y-2">
    <h1 class="text-2xl font-bold">Diff Checker</h1>
  </div>
  <div class="flex">
    <div class="flex flex-col space-y-2 w-1/2 pr-2">
      <h2 class="text-xm font-bold">Text 1</h2>
      <Textarea
        bind:value={$text1}
        class="w-full h-80 p-2 border border-gray-300 rounded"
        placeholder="Enter text to compare"
      />
    </div>
    <div class="flex flex-col space-y-2 w-1/2 pl-2">
      <h2 class="text-xm font-bold">Text 2</h2>
      <Textarea
        bind:value={$text2}
        class="w-full h-80 p-2 border border-gray-300 rounded"
        placeholder="Enter text to compare"
      />
    </div>
  </div>

  <!-- Diff 결과 표시 -->
  <div class="mt-4 p-4 border rounded">
    <h2 class="text-lg font-bold mb-2">Differences</h2>
    <div>
      {#each $diffResult as {type, text, classMetadata}}
        <span class={classMetadata}>{text}</span>
      {/each}
    </div>
  </div>
</div>