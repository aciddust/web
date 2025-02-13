<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { onMount, onDestroy } from 'svelte';

  export let buttonText;
  export let isOpen = false;

  function toggleDrawer() {
    isOpen = !isOpen;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      isOpen = false;
    }
  }

  function handleClickOutside(event: MouseEvent) {
    const backdrop = event.target as HTMLElement;
    if (backdrop.classList.contains('backdrop')) {
      isOpen = false;
    }
  }

  // 키보드 이벤트 리스너 등록/제거
  onMount(() => {
    window.addEventListener('keydown', handleKeydown);

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '//w.soundcloud.com/player/api.js';
    document.head.appendChild(script);
  });

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeydown);
  });
</script>

<Button  variant="outline" on:click={toggleDrawer}>{buttonText}</Button>

{#if isOpen}
  <div 
    class="backdrop fixed inset-0 transition-opacity duration-300 ease-out z-0"
    on:click={handleClickOutside}
    class:opacity-0={!isOpen}
    class:opacity-100={isOpen}
  />
{/if}

<div class="fixed bottom-0 left-0 w-full">
  <div
    class="fixed bottom-0 left-0 w-full h-1/2 bg-white shadow-lg p-4 z-1 transition-transform duration-300 ease-out"
    class:translate-y-0={isOpen}
    class:translate-y-full={!isOpen}
  >
    <div class="w-full h-[calc(100%-2rem)]">
      <iframe
        id="scloud-player"
        width="100%"
        height="100%"
        scrolling="yes"
        frameborder="no"
        allow="autoplay"
        src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/300494469&color=%23252503&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false">
      </iframe>
      <div style="font-size: 10px; color: #cccccc;line-break: anywhere;word-break: normal;overflow: hidden;white-space: nowrap;text-overflow: ellipsis; font-family: Interstate,Lucida Grande,Lucida Sans Unicode,Lucida Sans,Garuda,Verdana,Tahoma,sans-serif;font-weight: 100;">
        <a href="https://soundcloud.com/chillhopdotcom" title="" target="_blank" style="color: #cccccc; text-decoration: none;"></a>
        <a href="https://soundcloud.com/chillhopdotcom/sets/lofihiphop" title="" target="_blank" style="color: #cccccc; text-decoration: none;"></a>
      </div>
    </div>
  </div>
</div>

<style lang="postcss">
  .backdrop {
    backdrop-filter: blur(2px);
  }
</style>