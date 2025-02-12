<script lang="ts">

  import * as Drawer from "$lib/components/ui/drawer/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { type Writable } from "svelte/store";
  import Minus from "lucide-svelte/icons/minus";
  import Plus from "lucide-svelte/icons/plus";
  import { emojis } from "$lib/asmr/data";
  import { Progress } from "$lib/components/ui/progress/index.js";

  export let audioVolume: Writable<{[key: string]: number}>
  export let audioPlaying: Writable<{[key: string]: boolean}>

  function checkAudioPlaying() {
    return Object.keys($audioPlaying).some(key => $audioPlaying[key])
  }

</script>

<Drawer.Root>
  <Drawer.Trigger asChild let:builder>
    <Button builders={[builder]}>{emojis.volume}</Button>
  </Drawer.Trigger>
  <Drawer.Content>
    <Drawer.Header>
      <div class="flex items-center justify-center">
        {#if checkAudioPlaying()}
          <h2 class="text-lg font-semibold">Control Pannel</h2>
        {:else}
          <h2 class="text-lg font-semibold">No Audio Playing</h2>
        {/if}
      </div>
    </Drawer.Header>
    <div class="mx-auto w-full max-w-sm p-4">
      <div>
        <div class="flex flex-col w-full">
          <!-- for-each로 audioPlaying 모든 키 순회하여 writable(true인) 경우만 볼륨 - + 버튼 랜더링 -->
          {#each Object.keys($audioPlaying) as key}
            {#if $audioPlaying[key]}
              {#if key === 'piano'}
                <div class="flex items-center justify-between space-x-2 space-y-2">
                  <div id='emoji-{emojis[key]}' class="flex items-center justify-center space-x-2">
                    <span>{emojis[key]}</span>
                  </div>
                  <div id='progress-{emojis[key]}' class="flex items-center justify-center space-x-2 w-40">
                    <button type="button"
                      class="relative w-full h-4 cursor-pointer"
                      on:click={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const clickPosition = (e.clientX - rect.left) / rect.width;
                        const newValue = Math.max(0, Math.min(100, clickPosition * 100));
                        audioVolume.update(v => ({...v, [key]: newValue}));
                      }}
                      >
                      <Progress value={$audioVolume[key]} max={100} />
                    </button>
                  </div>
                  <div id='control-{emojis[key]}' class="flex items-center justify-center space-x-2">
                    <Button on:click={() => audioVolume.update(v => ({...v, [key]: Math.max(0, v[key] - 1)}))}>
                    <Minus size="18" />
                    </Button>
                    <div class="items-center text-center w-8">{$audioVolume[key].toFixed(1)}</div>
                    <Button on:click={() => audioVolume.update(v => ({...v, [key]: Math.min(100, v[key] + 1)}))}>
                    <Plus size="18" />
                    </Button>
                  </div>
                </div>
              {:else}
                <div class="flex items-center justify-between space-x-2 space-y-2">
                  <div id='emoji-{emojis[key]}' class="flex items-center justify-center space-x-2">
                    <span>{emojis[key]}</span>
                  </div>
                  <div id='progress-{emojis[key]}' class="flex items-center justify-center space-x-2 w-40">
                    <button type="button"
                      class="relative w-full h-4 cursor-pointer"
                      on:click={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const clickPosition = (e.clientX - rect.left) / rect.width;
                        const newValue = Math.max(0, Math.min(4, clickPosition * 4));
                        audioVolume.update(v => ({...v, [key]: newValue}));
                      }}
                      >
                      <Progress value={$audioVolume[key]} max={4} />
                    </button>
                  </div>
                  <div id='control-{emojis[key]}' class="flex items-center justify-center space-x-2">
                    <Button on:click={() => audioVolume.update(v => ({...v, [key]: Math.max(0, v[key] - 0.1)}))}>
                    <Minus size="18" />
                    </Button>
                    <div class="items-center text-center w-8">{$audioVolume[key].toFixed(1)}</div>
                    <Button on:click={() => audioVolume.update(v => ({...v, [key]: Math.min(4, v[key] + 0.1)}))}>
                    <Plus size="18" />
                    </Button>
                  </div>
                </div>
              {/if}
            {/if}
          {/each}
        </div>
      </div>
    </div>
    <Drawer.Footer>
      <Drawer.Close asChild let:builder>
        <Button builders={[builder]} variant="outline">Close</Button>
      </Drawer.Close>
    </Drawer.Footer>
  </Drawer.Content>
</Drawer.Root>