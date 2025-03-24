<script lang="ts">
  import { onMount } from 'svelte';
  import * as Card from "$lib/components/ui/card/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { writable } from 'svelte/store';
	import { genCode } from '@/utils';
	import { goto } from '$app/navigation';

  const spaceId = writable<string>('');

  onMount(() => {
    $spaceId = genCode(6);
  });

  const refreshSpaceId = () => {
    $spaceId = genCode(6);
  };

  const createSpace = async () => {
    let result;
    while (true) {
      result = await fetch(`/api/echo/${$spaceId}/enter`, {
        method: 'GET',
      });
      if (result.ok) {
        break;
      } else {
        $spaceId = genCode(6);
      }
    }
    goto(`/__private/echo/${$spaceId}`);
  }
</script>

<div class="w-full flex justify-center items-center" style='height: 90vh;'>
  <Card.Root class="w-[350px]">
    <Card.Header>
      <Card.Title>Create echo room</Card.Title>
      <Card.Description>Create your new echo room in one-click.</Card.Description>
    </Card.Header>
    <Card.Content>
      <div class="space-y-4 bg-gray-100 p-4 rounded-lg text-center font-bold">
        {$spaceId}
      </div>
    </Card.Content>
    <Card.Footer class="flex justify-between">
      <Button variant="outline" on:click={() => { refreshSpaceId() }}>Refresh</Button>
      <Button on:click={async () => { await createSpace() }}>Create</Button>
    </Card.Footer>
  </Card.Root>
</div>
