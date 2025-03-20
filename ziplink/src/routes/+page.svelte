<script lang='ts'>
  import { slide } from 'svelte/transition';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
  import Copy from "lucide-svelte/icons/copy";
  import SquareArrowOutUpRight from "lucide-svelte/icons/square-arrow-out-up-right";
	import { toast } from 'svelte-sonner';
	import { writable } from 'svelte/store';

  const inputUrl = writable<string>();
  const outputUrl = writable<string>();

  const setUrl = () => {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { type: 'SHORTEN_URL', url: $inputUrl },
        response => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
            return;
          }
          if (response.success) {
            resolve(response.data);
          } else {
            reject(response.error);
          }
        }
      );
    });
  }
</script>

<div class="height-full w-full flex flex-col items-center justify-center">
  <div class='w-full flex flex-col items-center justify-center'>
    <div class="flex flex-col justify-center mt-4 border border-gray-200 p-4 rounded space-y-4">
      <div class='flex items-center justify-center'>
        <h1 class='text-4xl font-bold'>ZipLink</h1>
      </div>
      <div class='flex flex-col space-y-1'>
        <Input
          class="w-[300px]"
          id='url'
          type='text'
          placeholder='https://z1p.link'
          bind:value={$inputUrl}
        />
      </div>
      <div class='flex justify-center'>
        <Button on:click={() => {
          if (!$inputUrl.startsWith('http')) {
            toast.error('URL must be startswith http or https');
            return;
          }
          if (!$inputUrl) {
            toast.error('URL is required');
            return;
          }
          toast.promise(setUrl(), {
            loading: 'Shortening...',
            success: (data) => {
              outputUrl.set(data.url);
              return 'Done';
            },
            error: (err: any) => {
              console.error(err);
              return 'Error.. Try later';
            }
          });
        }}>Shorten</Button>
      </div>
    </div>
  </div>

  {#if $outputUrl}
  <div
    class='w-full flex flex-col items-center justify-center mt-4'
    in:slide={{ duration: 300, delay: 0 }}
    out:slide={{ duration: 300, delay: 0 }}
  >
    <div class="flex flex-col justify-center border border-gray-200 p-4 rounded space-y-4">
      <div class='flex items-center justify-center'>
        <h1 class='text-4xl font-bold'>Output</h1>
      </div>
      <div class='flex flex-col space-y-1'>
        <div class="relative w-[300px]">
          <button
            class="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500"
            on:click={() => window.open($outputUrl, '_blank')}
          >
            <SquareArrowOutUpRight size={16} />
          </button>
          <Input
            class="w-full pl-8 pr-8"
            id='output'
            type='text'
            bind:value={$outputUrl}
          />
          <button class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer hover:text-gray-700"
            on:click={() => {
              navigator.clipboard.writeText($outputUrl);
              toast('Copied to clipboard');
            }}
          >
            <Copy size={16} />
          </button>
        </div>
      </div>
      <!-- copy button -->
      <div class='flex w-full'>
        <div class='flex w-full justify-center space-x-2'>
          <Button variant='outline' on:click={() => outputUrl.set('')}>Clear</Button>
        </div>
      </div>
    </div>
  </div>
  {/if}
</div>

<style>
  .height-full {
    height: 80vh;
  }
</style>