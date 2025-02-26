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
    wordCloudInputExample,
    wordCloudStopwordsExample,
  } from '$lib/examples';
  import {
    runPython,
    getClientCode,
    saveB64AsBinary,
    loadExternalFileAsBytes,
  } from '$lib/pyodide/bridge';
  import { toast } from 'svelte-sonner';

  let pyodide: any;
  let code: string = '';
  let loading = true;
  let wordCloudInput = wordCloudInputExample
  let wordCloudStopwords = wordCloudStopwordsExample
  let wordCloudImageString = ''
  const serviceName = 'wordcloud-generator'

  onMount(async () => {
      try {
          pyodide = await loadPyodide({indexURL: PYODIDE_URL});
          await pyodide.loadPackage('micropip');
          const micropip = pyodide.pyimport('micropip');
          await micropip.install('numpy');
          await micropip.install('pillow');
          await micropip.install('wordcloud');
          const moduleName = PYODIDE_ROUTES[serviceName].module;
          const clientFilePath = PYODIDE_ROUTES[serviceName].clientFilePath;
          code = await getClientCode(moduleName, clientFilePath)
          await pyodide.runPythonAsync(
            await saveB64AsBinary(
              await loadExternalFileAsBytes(moduleName),
              `${moduleName}.pyc`,
            )
          );
          await pyodide.runPythonAsync(
            await saveB64AsBinary(
              await loadExternalFileAsBytes("/PretendardVariable.ttf"),
              "PretendardVariable.ttf",
            )
          )
          code = await getClientCode(moduleName, clientFilePath)
          loading = false;
          toast.success('Ready!')
      } catch (error) {
          toast.error('Failed to load')
      }
  });

  const runClientCode = async (
    pyodide: any,
    inputData: string,
    stopWords: string,
  ) => {
    if (!code) return
    if (!pyodide) return
    let newCode = (
      `${code}\n` +
      `func(module, """${inputData}""", """${stopWords}""")`
    )
    console.log(newCode)
    await runPython(pyodide, newCode)
    const imgData = await pyodide.FS.readFile('result.png', { encoding: 'binary' })
    const arrBuffer = new Uint8Array(imgData).buffer
    let binary = ''
    const bytes = new Uint8Array(arrBuffer)
    const len = bytes.byteLength
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    const b64String = btoa(binary)
    wordCloudImageString = `data:image/png;base64,${b64String}`
  }
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
  <h1 class="text-2xl font-bold">Wordcloud Generator</h1>
  <div class="flex justify-stretch space-y-4">
    <div class="flex flex-col pt-4 w-full pb-4">
      <div class="flex flex-col space-y-2">
        <h2 class="text-xl font-bold">Input</h2>
        <Textarea bind:value={wordCloudInput} class="w-full h-48 p-2 border rounded-md" id="wordcloud-input"/>
      </div>
      <div class="flex flex-col space-y-2 pt-4">
        <h2 class="text-xl font-bold">Stopwords</h2>
        <Textarea bind:value={wordCloudStopwords} class="w-full h-48 p-2 border rounded-md" id="wordcloud-stopwords"/>
      </div>
    </div>
    <div class="flex">
      {#if wordCloudImageString}
        <img
          src={wordCloudImageString}
          alt="Word Cloud"
        />
      {/if}
    </div>
  </div>
  <div class="flex justify-center">
    <Button on:click={
      async () => {
        await runClientCode(pyodide, wordCloudInput, wordCloudStopwords)
        toast.success('Done!')
      }} class="w-full">
      Generate
    </Button>
  </div>
{/if}