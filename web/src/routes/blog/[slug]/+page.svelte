<script lang="ts">
  import Button from '$lib/components/ui/button/button.svelte';
  import { PUBLIC_CDN_URL, PUBLIC_CDN_REPO } from '$env/static/public';
  import { onMount } from 'svelte';
  import { Marked } from "marked";
  import { markedHighlight } from "marked-highlight";
  import hljs from 'highlight.js';
  import 'highlight.js/styles/obsidian.css'; // 또는 다른 테마: vs, atom-one-dark, dracula 등

  export let data;
  const { props } = data;
  const { content } = props;

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
        // 외부 URL(http://, https://)이나 절대 경로(/)로 시작하는 경우는 그대로 유지
        if (href && !href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('/')) {
          if (href.startsWith(PUBLIC_CDN_REPO)) {
            // PUBLIC_CDN_REPO 제거
            href = href.replace(PUBLIC_CDN_REPO, '');
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
  });
</script>

<div class="max-w-4xl mx-auto px-4 py-8">
  <div class="flex items-center justify-between mb-8 sticky top-5 bg-transparent z-10">
    <Button on:click={() => history.back()} variant="outline">
      Back
    </Button>
    <div class="flex space-x-4">
      <Button variant="outline" on:click={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        Top
      </Button>
      <Button variant="outline" on:click={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>
        Bottom
      </Button>
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
        Share
      </Button>
    </div>
  </div>
  <article class="prose prose-lg prose-slate mx-auto">
    {@html parsedContent}
  </article>
</div>

<style>
  /* 코드 블록에 대한 추가 스타일링 */
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