<script lang="ts">
  import { Input } from "$lib/components/ui/input";
  import { writable } from 'svelte/store';
  import { toast } from 'svelte-sonner';

  const b64Encode = writable('');
  const b64Decode = writable('');

  $: {
    try {
      if ($b64Encode) {
        b64Decode.set(btoa($b64Encode));
      } else if ($b64Encode === '') {
        b64Decode.set('');
      } else {
        b64Encode.set('');
      }
    } catch (error) {
      toast.error('Failed to encode')
    }
  }

  $: {
    try {
      if ($b64Decode) {
        b64Encode.set(atob($b64Decode));
      } else if ($b64Decode === '') {
        b64Encode.set('');
      } else {
        b64Decode.set('');
      }
    } catch (error) {
      toast.error('Failed to decode')
    }
  }
</script>

<div class="flex flex-col space-y-2">
  <h2 class="text-lg font-bold">Base64</h2>
</div>
<div class="flex">
  <div class="flex flex-col space-y-2 w-1/2 pr-2">
    <h2 class="text-xm font-bold">Encode</h2>
    <Input
      id="b64-e-in"
      placeholder="Enter text to encode"
      bind:value={$b64Encode}
    />
  </div>
  <div class="flex flex-col space-y-2 w-1/2 pl-2">
    <h2 class="text-xm font-bold">Decode</h2>
    <Input
      id="b64-d-in"
      placeholder="Enter text to decode"
      bind:value={$b64Decode}
    />
  </div>
</div>