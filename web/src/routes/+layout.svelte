<script lang="ts">
	import '../app.css';
	import { Toaster } from "$lib/components/ui/sonner";
	import * as Menubar from "$lib/components/ui/menubar";
	import Container from "$lib/components/ui/area/container.svelte";
	import { openNewTab, routeToPage }  from "$lib/utils";
	import { DEFAULT_ROUTE, ISSUE_URL } from "$lib/constants";
	let { children } = $props();

	import { toast } from 'svelte-sonner';
</script>

<Toaster />

<Menubar.Root>
  <Menubar.Menu>
    <Menubar.Trigger>T00LK1T</Menubar.Trigger>
    <Menubar.Content>
      <Menubar.Item on:click={() => routeToPage(DEFAULT_ROUTE)}>
				Home
			</Menubar.Item>
      <Menubar.Separator />
      <Menubar.Item on:click={() => routeToPage('markdown-table-string')}>
				Markdown table to string
			</Menubar.Item>
      <Menubar.Item on:click={() => routeToPage('query-beautifier')}>
				Query Beautifier
			</Menubar.Item>
			<Menubar.Item on:click={() => routeToPage('wordcloud-generator')}>
				WordCloud Generator
			</Menubar.Item>
			<Menubar.Item on:click={() => routeToPage('encoder-decoder')}>
				Encoder/Decoder
			</Menubar.Item>
			<Menubar.Item on:click={() => routeToPage('diff-checker')}>
				Diff Checker
			</Menubar.Item>
			<Menubar.Item on:click={() => routeToPage('korean-map-extractor')}>
				Korean Map Extractor
			</Menubar.Item>
			<Menubar.Item on:click={() => routeToPage('asmr-channel')}>
				ASMR
			</Menubar.Item>
      <Menubar.Separator />
      <Menubar.Item on:click={async () => {
				// press esc key to close the menu
				new KeyboardEvent('keydown', {
					key: 'Escape',
					code: 'Escape',
					keyCode: 27,
					which: 27,
					bubbles: true,
				});
				await new Promise((resolve) => setTimeout(resolve, 200));
				window.print()
			}}>
				Print
				<Menubar.Shortcut>⌘P</Menubar.Shortcut>
			</Menubar.Item>
			<!-- <Menubar.Item>Save as PDF</Menubar.Item> -->
    </Menubar.Content>
  </Menubar.Menu>
	<Menubar.Menu>
		<Menubar.Trigger>Help</Menubar.Trigger>
		<Menubar.Content>
			<Menubar.Item on:click={() => toast.info('Work in progress')}>
				Contact
			</Menubar.Item>
			<Menubar.Item on:click={() => toast.info('Work in progress')}>
				Feedback
			</Menubar.Item>
			<Menubar.Item on:click={() => openNewTab(ISSUE_URL)}>
				Report a bug
			</Menubar.Item>
		</Menubar.Content>
	</Menubar.Menu>
</Menubar.Root>

<Container>
{@render children()}
</Container>
