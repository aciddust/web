<script lang='ts'>
  import { slide } from 'svelte/transition';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
  import Copy from "lucide-svelte/icons/copy";
  import SquareArrowOutUpRight from "lucide-svelte/icons/square-arrow-out-up-right";
  import Share from "lucide-svelte/icons/share";
	import { toast } from 'svelte-sonner';
	import { writable } from 'svelte/store';

  const inputUrl = writable<string>();
  const outputUrl = writable<string>();

  const setUrl = async () => {
    const url = $inputUrl;
    if (!url.startsWith('http')) {
      toast.error("URL must be startswith http or https");
      return;
    }
    const response = await fetch('/api/ziplink', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });
    const data = await response.json();
    console.log(data);
    return data;
  }
</script>

<div class="height-full w-full flex flex-col items-center justify-center">
  <div class='w-full flex flex-col items-center justify-center'>
    <div class="flex flex-col justify-center mt-4 border border-gray-200 p-4 rounded space-y-4">
      <div class='flex items-center justify-center space-x-2'>
        <h1 class='text-4xl font-bold'>ZipLink</h1>
        <button 
          type="button"
          on:click={() => window.open('https://chromewebstore.google.com/detail/kjclbbdiofgkkpncjhfmhaoiboigmobb?utm_source=item-share-cb', '_blank')}
          on:keydown={(e) => e.key === 'Enter' && window.open('https://chromewebstore.google.com/detail/kjclbbdiofgkkpncjhfmhaoiboigmobb?utm_source=item-share-cb', '_blank')}
          aria-label="Open Chrome Extension"
          class="bg-transparent border-none cursor-pointer p-0">
          <svg
            class='w-8 h-8 text-blue-500'
            role="img"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"><title>Google Chrome</title><path d="M12 0C8.21 0 4.831 1.757 2.632 4.501l3.953 6.848A5.454 5.454 0 0 1 12 6.545h10.691A12 12 0 0 0 12 0zM1.931 5.47A11.943 11.943 0 0 0 0 12c0 6.012 4.42 10.991 10.189 11.864l3.953-6.847a5.45 5.45 0 0 1-6.865-2.29zm13.342 2.166a5.446 5.446 0 0 1 1.45 7.09l.002.001h-.002l-5.344 9.257c.206.01.413.016.621.016 6.627 0 12-5.373 12-12 0-1.54-.29-3.011-.818-4.364zM12 16.364a4.364 4.364 0 1 1 0-8.728 4.364 4.364 0 0 1 0 8.728Z"/>
          </svg>
        </button>
      </div>
      <div class='flex flex-col space-y-1'>
        <div class="relative w-[300px]">
          <Input
            class="w-full"
            id='url'
            type='text'
            placeholder='https://example.com'
            bind:value={$inputUrl}
            on:keydown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                toast.promise(setUrl(), {
                  loading: 'Shortening...',
                  success: (data) => {
                    outputUrl.set(data.url);
                    return 'Done';
                  },
                  error: (err) => {
                    console.error(err);
                    return 'Error.. Try later';
                  }
                });
              }
            }}
          />
        </div>
      </div>
      <div class='flex justify-center'>
        <Button on:click={() => {
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
      <div class='flex flex-col space-y-1'>
        <div class="relative w-[300px]">
          <div class="flex items-center w-full relative">
            <button
              on:click={() => window.open($outputUrl, '_blank')}
              class="absolute left-2 text-gray-500">
              <SquareArrowOutUpRight size={18}/>
            </button>
            <Input
              class="w-full pl-9 pr-10"
              id='output'
              type='text'
              placeholder='https://z1p.link'
              bind:value={$outputUrl}
            />
            <button
              class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
              on:click={() => {
              navigator.clipboard.writeText($outputUrl);
              toast.success('Copied to clipboard');
              }}
              aria-label="Copy to clipboard">
              <Copy size={18} />
            </button>
            <button
              class="absolute right-10 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
              on:click={() => {
                navigator.clipboard.writeText($outputUrl);
                navigator.share({
                  title: 'ZipLink',
                  text: 'Check out this link!',
                  url: $outputUrl
                });
              }}
              aria-label="Share"
            >
              <Share size={18} />
            </button>
          </div>
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