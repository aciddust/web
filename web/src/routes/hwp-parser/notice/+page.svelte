<script lang="ts">
  import { onMount } from 'svelte';
  import { loadPyodide } from 'pyodide';
  import { toast } from 'svelte-sonner';
  import { writable } from 'svelte/store';
  import { PYODIDE_ROUTES, PYODIDE_URL } from '$lib/constants';
	import { getClientCode, loadExternalFileAsBytes, saveB64AsBinary } from '@/pyodide/bridge';
	import Textarea from '@/components/ui/textarea/textarea.svelte';
	import {
    Button,
    buttonVariants
  } from "$lib/components/ui/button/index.js";
	import Copy from 'lucide-svelte/icons/copy';
  import RefreshCw from 'lucide-svelte/icons/refresh-cw';
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import * as Select from "$lib/components/ui/select";

  let pyodide: any;
  let loading = true;
  let code = ''
  let parsedText = ''
  let jsonText = ''
  const selectedType = writable({ value: "A", label: 'Type A: 20250328' });
  const serviceName = 'hwp-parser'

  const summarize = async () => {
    const URL = `/api/parse-notice/type-${$selectedType.value.toLowerCase() ?? 'a'}`;
    let currentType = $selectedType.value ?? 'A';
    try {
      const response = await fetch(URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: parsedText
        }),
      });
      const data = await response.json();
      jsonText = JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Error summarizing text:', error);
      toast.error('Failed to summarize text');
      jsonText = JSON.stringify({ error: 'Failed to summarize text' }, null, 2);
    }
  }

  onMount(async () => {
      let isOkay: boolean = false;
      toast.loading('Loading...');
      try {
          pyodide = await loadPyodide({indexURL: PYODIDE_URL});
          const moduleName = PYODIDE_ROUTES[serviceName].module;
          const clientFilePath = PYODIDE_ROUTES[serviceName].clientFilePath;
          code = await getClientCode(moduleName, `/${serviceName}/${clientFilePath}`)
          await pyodide.loadPackage('micropip');
          const micropip = pyodide.pyimport('micropip');
          await micropip.install('olefile');
          await pyodide.runPythonAsync(
            saveB64AsBinary(
              await loadExternalFileAsBytes(`/${serviceName}/${moduleName}`),
              `${moduleName}.pyc`,
            )
          );
          loading = false;
          isOkay = true;
          toast.success('Ready!');
      } catch (error) {
          toast.error('Pyodide: Failed to load pyhwp')
      }
      toast.dismiss();
      if (isOkay) toast.success('Ready!')
      else toast.error('Failed to load pyhwp');
  });

  const handleDrop = async (e: DragEvent) => {
    toast.loading('Loading...');
    loading = true;
    e.preventDefault();
    const file = e.dataTransfer?.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const buffer = reader.result as ArrayBuffer;
        const bytes = new Uint8Array(buffer);
        await pyodide.FS.writeFile('temp.hwp', bytes);
        // show file list
        const newCode = `${code}\nresult = func(module, "temp.hwp")`;
        await pyodide.runPythonAsync(newCode);
        // Get the result from Python global namespace
        const result = pyodide.globals.get('result');
        parsedText = result.toString();
        await summarize();
        toast.success('File parsed successfully!');
      } catch (error) {
        console.error('Error processing file:', error);
        toast.error('Failed to process file');
      } finally {
        loading = false;
      }
    };
    reader.readAsArrayBuffer(file);
  }

  const handleClick = async (e: any) => {
    toast.loading('Loading...');
    loading = true;
    e.preventDefault();
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.hwp';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const buffer = reader.result as ArrayBuffer;
          const bytes = new Uint8Array(buffer);
          await pyodide.FS.writeFile('temp.hwp', bytes);
          // show file list
          const newCode = `${code}\nresult = func(module, "temp.hwp")`;
          await pyodide.runPythonAsync(newCode);
          // Get the result from Python global namespace
          const result = pyodide.globals.get('result');
          parsedText = result.toString();
          await summarize();
          toast.success('File parsed successfully!');
        } catch (error) {
          console.error('Error processing file:', error);
          toast.error('Failed to process file');
        } finally {
          loading = false;
        }
      };
      reader.readAsArrayBuffer(file);
    };
    input.click();
  }

</script>

<div class='flex flex-col items-center'>
  <Dialog.Root>
    <Dialog.Trigger>
      <h1 class='text-2xl font-bold'>HWP Parser</h1>
    </Dialog.Trigger>
    <Dialog.Content class="sm:max-w-[425px]">
      <Dialog.Header>
        <Dialog.Title>HWP Parser</Dialog.Title>
        <Dialog.Description>
          공공기관에서 배포된 채용공고가 HWP 문서로 작성되어있는 경우가 많습니다.
          이를 텍스트와 JSON 형태로 확인하기 위해 작성한 페이지입니다.
        </Dialog.Description>
      </Dialog.Header>
    </Dialog.Content>
  </Dialog.Root>
  <p class='text-lg pb-4'>Upload a .hwp file to parse its content</p>
  <Select.Root
    bind:selected={$selectedType}
  >
    <Select.Trigger class="w-[180px]">
      <Select.Value placeholder="Output Type" />
    </Select.Trigger>
    <Select.Content>
      <Select.Item value="A">Type A: 20250328</Select.Item>
      <Select.Item value="B">Type B: 20250329</Select.Item>
      <Select.Item value="C">Type C: 20250330</Select.Item>
    </Select.Content>
  </Select.Root>
</div>
<div class='flex items-center space-x-4 pt-4'>
  <div class="w-full flex flex-col items-center space-y-2">
    <div
      class="drop-zone w-full h-96 flex flex-col items-center justify-center"
      role="button"
      aria-label="Upload .hwp file"
      tabindex="0"
      on:click|preventDefault={handleClick}
      on:keydown|preventDefault={e => { if (e.key === 'Enter' || e.key === ' ') handleClick(e); }}
      on:dragover|preventDefault={e => { if (e.dataTransfer) e.dataTransfer.dropEffect = "copy"; }}
      on:drop|preventDefault={handleDrop}>
      <p class="drop-text">
        {loading ? 'Loading...' : 'Drop .hwp file here'}
      </p>
    </div>
    <Button
      class='w-full'
      disabled={loading || !parsedText}
      on:click={() => {
        // clean parsed text and json text
        parsedText = '';
        jsonText = '';
        toast.success('Text cleared!');
      }}
    >
      {#if loading}
        Loading
      {:else if !parsedText}
        Waiting
      {:else}
        <RefreshCw size={24} />
      {/if}
    </Button>
  </div>
  <div class='w-full flex flex-col items-center space-y-2'>
    <div class="w-full flex flex-col items-center space-y-2">
      <div class="relative w-full">
        <Textarea
          disabled
          class='w-full h-96 p-2 border border-gray-300 rounded'
          placeholder='Parsed text will be shown here'
          bind:value={parsedText}
        ></Textarea>
      </div>
      <Button
        class='w-full'
        disabled={loading || !parsedText}
        on:click={() => {
          navigator.clipboard.writeText(parsedText);
          toast.success('Text copied to clipboard!');
        }}
      >
        {#if loading}
          Loading
        {:else if !parsedText}
          Waiting
        {:else}
          <Copy size={24} />
        {/if}
      </Button>
    </div>
  </div>
  <div class='w-full flex flex-col items-center space-y-2'>
    <div class="w-full flex flex-col items-center space-y-2">
      <div class="relative w-full">
        <Textarea
          disabled
          class='w-full h-96 p-2 border border-gray-300 rounded'
          placeholder='Summarized json will be shown here'
          bind:value={jsonText}
        ></Textarea>
      </div>
      <Button
        class='w-full'
        disabled={loading || !parsedText}
        on:click={() => {
          navigator.clipboard.writeText(jsonText);
          toast.success('JSON copied to clipboard!');
        }}
      >
        {#if loading}
          Loading
        {:else if !parsedText}
          Waiting
        {:else}
          <Copy size={24} />
        {/if}
      </Button>
    </div>
  </div>
</div>





<style>
  .drop-zone {
    border: 2px dashed #ccc;
    border-radius: 8px;
    padding: 2rem;
    text-align: center;

    background-color: #f9f9f9;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .drop-zone:hover {
    background-color: #eaeaea;
    border-color: #999;
  }

  .drop-text {
    font-size: 1.2rem;
    color: #555;
  }
</style>
