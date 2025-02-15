<script lang="ts">
  import { Textarea } from "$lib/components/ui/textarea";
  import { writable, derived } from 'svelte/store';
  import { slide } from 'svelte/transition';
  import DiffMatchPatch from 'diff-match-patch';
	import Button from "$lib/components/ui/button/button.svelte";

  const text1 = writable('');
  const text2 = writable('');

  let leftDiffElement: HTMLDivElement;
  let rightDiffElement: HTMLDivElement;

  let showInput = true;

  const dmp = new DiffMatchPatch();

  function syncScroll(e: Event) {
    const target = e.target as HTMLDivElement;
    if (target === leftDiffElement) {
      rightDiffElement.scrollTop = target.scrollTop;
      rightDiffElement.scrollLeft = target.scrollLeft;
    } else {
      leftDiffElement.scrollTop = target.scrollTop;
      leftDiffElement.scrollLeft = target.scrollLeft;
    }
  }

  const splitDiffResult = derived([text1, text2], ([$text1, $text2]) => {
    const diff = dmp.diff_main($text1, $text2);
    dmp.diff_cleanupSemantic(diff);

    const leftParts: Array<{text: string, className: string, lineNumber: number}> = [];
    const rightParts: Array<{text: string, className: string, lineNumber: number}> = [];

    let leftLineCount = 1;
    let rightLineCount = 1;

    diff.forEach(([type, text]) => {
      // 텍스트를 줄 단위로 분리
      const lines = text.split('\n');

      lines.forEach((line, index) => {
        const isLastLine = index === lines.length - 1;
        if (type === -1) { // 삭제된 부분
          leftParts.push({
            text: line + (isLastLine ? '' : '\n'),
            className: 'bg-red-200',
            lineNumber: leftLineCount++
          });
          if (!isLastLine) {
            rightParts.push({ text: '\n', className: '', lineNumber: rightLineCount++ });
          }
        } else if (type === 1) { // 추가된 부분
          rightParts.push({
            text: line + (isLastLine ? '' : '\n'),
            className: 'bg-green-200',
            lineNumber: rightLineCount++
          });
          if (!isLastLine) {
            leftParts.push({ text: '\n', className: '', lineNumber: leftLineCount++ });
          }
        } else { // 변경되지 않은 부분
          leftParts.push({
            text: line + (isLastLine ? '' : '\n'),
            className: '',
            lineNumber: leftLineCount++
          });
          rightParts.push({
            text: line + (isLastLine ? '' : '\n'),
            className: '',
            lineNumber: rightLineCount++
          });
        }
      });
    });

    return { leftParts, rightParts };
  });
</script>

<div class="flex flex-col space-y-4">
  <div class="flex flex-col space-y-2">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Diff Checker</h1>
      <Button variant="outline" on:click={() => showInput = !showInput}>{showInput ? 'Hide' : 'Show'}</Button>
    </div>
  </div>
  {#if showInput}
  <div class="flex" id="input-area" transition:slide>
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
  {/if}

  <!-- Diff 결과 표시 -->
  <div class="mt-4 p-4 border rounded">
    <h2 class="text-lg font-bold mb-2">Differences</h2>
    <div class="flex">
      <div class="w-1/2 pr-2 border-r">
        <h3 class="text-sm font-semibold mb-2">Text 1 Changes</h3>
        <div
          bind:this={leftDiffElement}
          on:scroll={syncScroll}
          class="font-mono whitespace-pre max-h-[500px] overflow-auto">
          {#each $splitDiffResult.leftParts as {text, className, lineNumber}}
            <div class="flex">
              <span class="w-8 text-gray-500 select-none">{lineNumber}</span>
              <span class={className}>{text}</span>
            </div>
          {/each}
        </div>
      </div>
      <div class="w-1/2 pl-2">
        <h3 class="text-sm font-semibold mb-2">Text 2 Changes</h3>
        <div
          bind:this={rightDiffElement}
          on:scroll={syncScroll}
          class="font-mono whitespace-pre max-h-[500px] overflow-auto">
          {#each $splitDiffResult.rightParts as {text, className, lineNumber}}
            <div class="flex">
              <span class="w-8 text-gray-500 select-none">{lineNumber}</span>
              <span class={className}>{text}</span>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>