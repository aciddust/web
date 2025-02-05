<script lang="ts">
  import { onMount } from 'svelte';
  import { loadPyodide } from 'pyodide';
  import { Skeleton } from '$lib/components/ui/skeleton';
  import { Textarea } from '$lib/components/ui/textarea';
  import { Button } from '$lib/components/ui/button';
  import {
    PYODIDE_URL,
    PYODIDE_ROUTES,
  } from '$lib/constants';
  import {
    markdownTableExample,
    markdownTableStringExample,
  } from '$lib/examples';
  import { runPython } from '$lib/pyodide/bridge';
  import {
    saveB64AsBinary,
    loadExternalFileAsBytes,
    getClientCode,
  } from '$lib/pyodide/bridge';
	import { toast } from 'svelte-sonner';

  let pyodide: any;
  let loading = true;
  let markdownTableInput = markdownTableExample
  let markdownTableOutput = markdownTableStringExample
  let code = ''
  const serviceName = 'markdown-table-string'

  onMount(async () => {
      try {
          pyodide = await loadPyodide({indexURL: PYODIDE_URL});
          const moduleName = PYODIDE_ROUTES[serviceName].module;
          const clientFilePath = PYODIDE_ROUTES[serviceName].clientFilePath;
          code = await getClientCode(moduleName, `${serviceName}/${clientFilePath}`)
          await pyodide.runPythonAsync(
            saveB64AsBinary(
              await loadExternalFileAsBytes(`${serviceName}/${moduleName}`),
              `${moduleName}.pyc`,
            )
          );
          loading = false;
          toast.success('Pyodide: Ready!')
      } catch (error) {
          toast.error('Pyodide: Failed to load')
      }
  });


  const runClientCode = async (pyodide: any, inputData: string) => {
    if (!code) {
      return
    }
    if (!pyodide) {
      return
    }
    let newCode = `${code}\nfunc(module, """${inputData}""")`
    await runPython(pyodide, newCode).then((result) => {
      markdownTableOutput = result
    }).catch((error) => {
      console.error("Error:", error);
    });

  }

  $: runClientCode(pyodide, markdownTableInput)
</script>

{#if loading}
  <Skeleton class="h-4 w-1/4" />
  <br>
  <Skeleton class="h-4 w-1/5" />
  <br>
  <Skeleton class="h-4 w-1/6" />
  <Skeleton class="h-48 w-full" />
  <br>
  <Skeleton class="h-4 w-1/6" />
  <Skeleton class="h-48 w-full" />
  <br>
  <Skeleton class="h-10 w-full" />
{:else}
  <!-- <div>Pyodide ready!</div> -->
  <!-- check python version -->
  <!-- {#await runPython(pyodide, "import sys; sys.version") then version}
    <div>Python version: {version}</div>
  {:catch error}
    <div>Python version check failed: {error.message}</div>
  {/await} -->
  <div class="flex flex-col space-y-4">
    <div class="flex flex-col space-y-4">
      <p>Markdown Table to String</p>
      <div class="flex flex-col space-y-2">
        <label for="markdown-table-input">Input</label>
        <Textarea bind:value={markdownTableInput} class="w-full h-48 p-2 border rounded-md" id="markdown-table-input"/>
      </div>
      <div class="flex flex-col space-y-2">
        <label for="markdown-table-output">Output</label>
        <Textarea bind:value={markdownTableOutput} class="w-full h-48 p-2 border rounded-md" id="markdown-table-output"/>
      </div>
    </div>
    <!-- Copy Button, copy markdown-table-output textarea -->
    <Button on:click={
    () => {
      navigator.clipboard.writeText(markdownTableOutput)
      toast.success('Copied!')
    }} class="w-full">Copy</Button>
  </div>
{/if}