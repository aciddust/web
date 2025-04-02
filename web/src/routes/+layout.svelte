<script lang="ts">

	import '../app.css';
	import { dev } from '$app/environment';
	import { Toaster } from "$lib/components/ui/sonner";
	import * as Menubar from "$lib/components/ui/menubar";
	import Container from "$lib/components/ui/area/container.svelte";
	import { openNewTab, routeToPage, navigateWithRefresh }  from "$lib/utils";
	import { DEFAULT_ROUTE, ISSUE_URL } from "$lib/constants";
	let { children } = $props<{ children: any }>();

	import { page } from '$app/state';

	import { injectAnalytics } from '@vercel/analytics/sveltekit'
	injectAnalytics({ mode: dev ? 'development' : 'production' });

	const shouldShowGNB = () => {
		return !/^\/r\/[^/]+/.test(page.url.pathname);
  };

</script>

<Toaster />

{#if shouldShowGNB()}
<Menubar.Root>
  <Menubar.Menu> <!--0-->
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
			<Menubar.Item on:click={() => routeToPage('hmac')}>
				HMAC
			</Menubar.Item>
			<Menubar.Item on:click={() => routeToPage('echo')}>
				Echo
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
    </Menubar.Content>
  </Menubar.Menu>
	<Menubar.Menu> <!--1-->
		<Menubar.Trigger>Lab</Menubar.Trigger>
    <Menubar.Content>
      <Menubar.Item on:click={() => routeToPage('gallery')}>
				Gallery
			</Menubar.Item>
			<Menubar.Item on:click={() => routeToPage('chill')}>
				Chill
			</Menubar.Item>
			<Menubar.Item on:click={() => routeToPage('asmr')}>
				ASMR
			</Menubar.Item>
			<Menubar.Item on:click={() => routeToPage('binjector')}>
				Binjector
			</Menubar.Item>
			<Menubar.Item on:click={() => routeToPage('hwp-parser/notice')}>
				HWP: Parser
			</Menubar.Item>
		</Menubar.Content>
	</Menubar.Menu>
	<Menubar.Menu> <!--3-->
		<Menubar.Trigger>Services</Menubar.Trigger>
		<Menubar.Content>
			<Menubar.Item on:click={() => routeToPage('blog')}>
				Blog
			</Menubar.Item>
			<Menubar.Separator />
			<Menubar.Sub>
				<Menubar.SubTrigger>Arcadia: Beta</Menubar.SubTrigger>
				<Menubar.SubContent>
					<Menubar.Item on:click={() => navigateWithRefresh('school/schedule/초등학교', true)}>
						초등학교
					</Menubar.Item>
					<Menubar.Item on:click={() => navigateWithRefresh('school/schedule/중학교', true)}>
						중학교
					</Menubar.Item>
					<Menubar.Item on:click={() => navigateWithRefresh('school/schedule/고등학교', true)}>
						고등학교
					</Menubar.Item>
				</Menubar.SubContent>
			</Menubar.Sub>
			<Menubar.Item on:click={() => routeToPage('korean-map-extractor')}>
				Map Extractor
			</Menubar.Item>
			<Menubar.Item on:click={() => routeToPage('ziplink')}>
				ZipLink
			</Menubar.Item>
		</Menubar.Content>
	</Menubar.Menu>
	<Menubar.Menu> <!--4-->
		<Menubar.Trigger>Help</Menubar.Trigger>
		<Menubar.Content>
			<!-- <Menubar.Item on:click={() => toast.info('Work in progress')}>
				Contact
			</Menubar.Item> -->
			<Menubar.Item on:click={() => routeToPage('misc/feedback')}>
				Feedback
			</Menubar.Item>
			<!-- <Menubar.Item on:click={() => openNewTab(ISSUE_URL)}>
				Report a bug
			</Menubar.Item> -->
		</Menubar.Content>
	</Menubar.Menu>
</Menubar.Root>
{/if}

<Container>
{@render children()}
</Container>
