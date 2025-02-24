<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Skeleton } from '$lib/components/ui/skeleton';
  import { Textarea } from '$lib/components/ui/textarea';
  import { Button } from '$lib/components/ui/button';
  import {
    wordCloudInputExample,
    wordCloudStopwordsExample,
  } from '$lib/examples';
  import { toast } from 'svelte-sonner';

  let loading = true;
  let wordCloudInput = wordCloudInputExample
  let wordCloudStopwords = wordCloudStopwordsExample
  let wordCloudImageString = ''
  let worker: Worker;
  let isGenerating = false;

  onMount(async () => {
    try {
      worker = new Worker(
        new URL('$lib/workers/wordcloud.worker.ts', import.meta.url),
        { type: 'module' }
      );
      worker.onmessage = (e) => {
        const { type, payload } = e.data;
        switch (type) {
          case 'INIT_COMPLETE':
            loading = false;
            toast.success('Ready!');
            break;
          case 'GENERATE_COMPLETE':
            const arrBuffer = new Uint8Array(payload).buffer;
            let binary = '';
            const bytes = new Uint8Array(arrBuffer);
            const len = bytes.byteLength;
            for (let i = 0; i < len; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            const b64String = btoa(binary);
            wordCloudImageString = `data:image/png;base64,${b64String}`;
            isGenerating = false;
            toast.success('Done!');
            break;
          case 'ERROR':
            console.error(payload)
            toast.error(payload);
            isGenerating = false;
            break;
        }
      };

      // Worker 초기화
      worker.postMessage({
        type: 'INIT',
        payload: {
          'protocol': window.location.protocol,
          'host': window.location.host,
          'pathname': window.location.pathname,
        }
      });

    } catch (error) {
      toast.error('Failed to load');
    }
  });

  const generateWordCloud = async () => {
    if (isGenerating) return;

    isGenerating = true;
    worker.postMessage({
      type: 'GENERATE',
      payload: {
        input: wordCloudInput,
        stopwords: wordCloudStopwords
      }
    });
  };

  onDestroy(() => {
    if (worker) {
      worker.terminate();
    }
  });
</script>

{#if loading}
  <Skeleton class="h-4 w-1/4" />
  <br>
  <Skeleton class="h-4 w-1/5" />
  <br>
  <Skeleton class="h-4 w-1/6" />
  <Skeleton class="h-48 w-full" />
  <br>
  <Skeleton class="h-4 w-1/6" />
  <Skeleton class="h-48 w-full" />
  <br>
  <Skeleton class="h-10 w-full" />
{:else}
  <h1 class="text-2xl font-bold">Wordcloud Generator</h1>
  <div class="flex justify-stretch space-y-4">
    <div class="flex flex-col pt-4 w-full pb-4">
      <div class="flex flex-col space-y-2">
        <h2 class="text-xl font-bold">Input</h2>
        <Textarea bind:value={wordCloudInput} class="w-full h-48 p-2 border rounded-md" id="wordcloud-input"/>
      </div>
      <div class="flex flex-col space-y-2 pt-4">
        <h2 class="text-xl font-bold">Stopwords</h2>
        <Textarea bind:value={wordCloudStopwords} class="w-full h-48 p-2 border rounded-md" id="wordcloud-stopwords"/>
      </div>
    </div>
    <div class="flex">
      {#if wordCloudImageString}
        <img
          src={wordCloudImageString}
          alt="Word Cloud"
        />
      {/if}
    </div>
  </div>
  <div class="flex justify-center">
    <Button
      on:click={generateWordCloud}
      class="w-full"
      disabled={isGenerating}
    >
      {isGenerating ? 'Generating...' : 'Generate'}
    </Button>
  </div>
{/if}