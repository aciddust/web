<script lang="ts">
  import Button from '$lib/components/ui/button/button.svelte';
import * as marked from 'marked';
  import { onMount } from 'svelte';
  // import hljs from 'highlight.js';
  // import 'highlight.js/styles/github.css';

  export let data;
  const { props } = data;
  const { content } = props;

  let parsedContent = '';

  onMount(async () => {
    marked.setOptions({
      gfm: true,
      breaks: true,
      // highlight: function (code, lang) {
      //   return hljs.highlightAuto(code, [lang]).value;
      // },
    });
    parsedContent = await marked.parse(content);
    // if (hljs) {
    //   hljs.initHighlighting();
    // }
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

