<script lang="ts">
  import Button from '$lib/components/ui/button/button.svelte';
  import { PUBLIC_CDN_URL, PUBLIC_CDN_REPO } from '$env/static/public';
  import { onDestroy, onMount } from 'svelte';
  import { Marked } from "marked";
  import { markedHighlight } from "marked-highlight";
  import { browser } from '$app/environment';

  import hljs from 'highlight.js';
  import 'highlight.js/styles/obsidian.css'; // 또는 다른 테마: vs, atom-one-dark, dracula 등

  import ArrowDown from "lucide-svelte/icons/arrow-down";
  import ArrowUp from "lucide-svelte/icons/arrow-up";
  import Share from "lucide-svelte/icons/share";
  import Back from "lucide-svelte/icons/arrow-left";

  export let data;
  const { props } = data;
  const { content } = props;

  let scrollPos = 0;
  let documentHeight = 0;
  let windowHeight = 0;

  // 스크롤 위치에 따른 버튼 표시 여부 계산
  $: isAtTop = scrollPos < 50;
  $: isAtBottom = documentHeight - (scrollPos + windowHeight) < 50;

  function handleScroll() {
    if (!browser) return; // 브라우저 환경 확인
    scrollPos = window.scrollY;
    documentHeight = document.body.scrollHeight;
    windowHeight = window.innerHeight;
  }

  let parsedContent = '';

  const marked = new Marked(
    markedHighlight({
    emptyLangClass: 'hljs',
      langPrefix: 'hljs language-',
      highlight(code, lang, info) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
      }
    })
  );

  marked.setOptions({
    gfm: true,
    breaks: true,
    pedantic: false,
  });

  marked.use({
    renderer: {
      image(token) {
        let { href, title, text } = token;
        // href가 상대 경로인 경우에만 prefix 추가
        // 외부 URL(http://, https://)로 시작하는 경우는 그대로 유지
        if (href && !href.startsWith('http://') && !href.startsWith('https://')) {
          if (href.startsWith('/'+PUBLIC_CDN_REPO)) {
            // PUBLIC_CDN_REPO 제거
            href = href.replace('/'+PUBLIC_CDN_REPO, '');
          }
          href = `${PUBLIC_CDN_URL}/${href}?raw=true`;
        }
        // title 속성이 있으면 추가
        const titleAttr = title ? ` title="${title}"` : '';
        // alt 텍스트 사용
        return `<img src="${href}" alt="${text || ''}"${titleAttr} loading="lazy" class="rounded-md">`;
      }
    }
  })

  onMount(async () => {
    parsedContent = await marked.parse(content);

    if (browser) {
      // 초기값 설정
      documentHeight = document.body.scrollHeight;
      windowHeight = window.innerHeight;
      // 스크롤 이벤트 리스너 추가
      window.addEventListener('scroll', handleScroll);
    }
  });

  onDestroy(() => {
    // 스크롤 이벤트 리스너 제거
    if (browser) {
      window.removeEventListener('scroll', handleScroll);
    }
  });
</script>

<div class="max-w-4xl mx-auto px-4 pb-16">
  <div class="flex items-center justify-between mb-8 sticky top-5 bg-white z-10">
    <Button on:click={() => history.back()} variant="outline">
      <Back class="h-4 w-4" />
      <span class="sr-only">Back</span>
    </Button>
    <div class="flex space-x-4">
      {#if !isAtTop}
        <Button variant="outline" on:click={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <ArrowUp class="h-4 w-4" />
        </Button>
      {/if}
      {#if !isAtBottom}
        <Button variant="outline" on:click={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>
          <ArrowDown class="h-4 w-4" />
        </Button>
      {/if}
      <Button variant="outline" on:click={() => {
        if (navigator.share) {
          navigator.share({
            title: document.title,
            text: 'Check out this post!',
            url: window.location.href
          }).catch(err => console.error('Error sharing:', err));
        } else {
          alert('Web Share API not supported in your browser.');
        }
      }}>
        <Share class="h-4 w-4" />
      </Button>
    </div>
  </div>
  <!-- <article class="prose prose-slate mx-auto">
    {@html parsedContent}
  </article> -->
  <article class="prose mx-auto">
    {@html parsedContent}
  </article>
</div>

<style>
  /* 코드 블록에 대한 추가 스타일링 */

  :global(li code::before), 
  :global(li code::after),
  :global(p code::before),
  :global(p code::after) {
    content: none !important;
    display: none !important;
  }

  :global(.prose) {
    font-size: 0.95rem;
  }

  :global(.prose p, .prose li) {
    margin-top: 0.75em;
    margin-bottom: 0.75em;
  }

  :global(pre) {
    padding: 1em;
    border-radius: 6px;
    overflow: auto;
    position: relative;
  }
  :global(pre code) {
    background: transparent !important;
    padding: 0 !important;
  }
  /* 인라인 코드 스타일링 */
  :global(p code), :global(li code) {
    background-color: rgba(175, 184, 193, 0.2);
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 85%;
  }
</style>