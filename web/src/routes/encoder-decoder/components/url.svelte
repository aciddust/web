<script lang="ts">
  import { Input } from "$lib/components/ui/input";
  import { writable } from 'svelte/store';
  import { toast } from 'svelte-sonner';

  const urlEncode = writable('');
  const urlDecode = writable('');

  $: {
    try {
      if ($urlEncode) {
        urlDecode.set(encodeURIComponent($urlEncode));
      } else if ($urlEncode === '') {
        urlDecode.set('');
      } else {
        urlEncode.set('');
      }
    } catch (error) {
      toast.error('Failed to encode')
    }
  }

  $: {
    try {
      if ($urlDecode) {
        urlEncode.set(decodeURIComponent($urlDecode));
      } else if ($urlDecode === '') {
        urlEncode.set('');
      } else {
        urlDecode.set('');
      }
    } catch (error) {
      toast.error('Failed to decode')
    }
  }
</script>

<div class="flex flex-col space-y-2">
  <h2 class="text-lg font-bold">URL</h2>
</div>
<div class="flex">
  <div class="flex flex-col space-y-2 w-1/2 pr-2">
    <h2 class="text-xm font-bold">Encode</h2>
    <Input
      id="b64-e-in"
      placeholder="Enter text to encode"
      bind:value={$urlEncode}
    />
  </div>
  <div class="flex flex-col space-y-2 w-1/2 pl-2">
    <h2 class="text-xm font-bold">Decode</h2>
    <Input
      id="b64-d-in"
      placeholder="Enter text to decode"
      bind:value={$urlDecode}
    />
  </div>
</div>