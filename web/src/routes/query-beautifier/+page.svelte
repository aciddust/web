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
    queryInputExample,
    queryOutputExample,
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
  let queryInput = queryInputExample
  let queryOutput = queryOutputExample
  const serviceName = 'query-beautifier'

  onMount(async () => {
      try {
          pyodide = await loadPyodide({indexURL: PYODIDE_URL});
          await pyodide.loadPackage('micropip');
          const micropip = pyodide.pyimport('micropip');
          await micropip.install('sqlparse');
          const moduleName = PYODIDE_ROUTES[serviceName].module;
          const clientFilePath = PYODIDE_ROUTES[serviceName].clientFilePath;
          code = await getClientCode(moduleName, `${serviceName}/${clientFilePath}`)
          await pyodide.runPythonAsync(
            saveB64AsBinary(
              await loadExternalFileAsBytes(`${serviceName}/${moduleName}`),
              `${moduleName}.pyc`,
            )
          );
          code = await getClientCode(moduleName, `${serviceName}/${clientFilePath}`)
          loading = false;
          toast.success('Ready!')
      } catch (error) {
          toast.error('Failed to load')
      }
  });

  const runClientCode = async (pyodide: any, inputData: string) => {
    if (!code) return
    if (!pyodide) return
    let newCode = (
      `import sqlparse\n` +
      `${code}\n` +
      `func(module, """${inputData}""")`
    )
    console.log(newCode)
    await runPython(pyodide, newCode).then((result) => {
      queryOutput = result
    }).catch((error) => {
      console.error("Error:", error);
    });
  }
  $: runClientCode(pyodide, queryInput)
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
  <div class="flex flex-col space-y-4">
    <div class="flex flex-col space-y-4">
      <h1 class="text-2xl font-bold">Query Beautifier</h1>
      <div class="flex flex-col space-y-2">
        <h2 class="text-xl font-bold">Input</h2>
        <Textarea bind:value={queryInput} class="w-full h-48 p-2 border rounded-md" id="query-input"/>
      </div>
      <div class="flex flex-col space-y-2">
        <h2 class="text-xl font-bold">Output</h2>
        <Textarea bind:value={queryOutput} class="w-full h-48 p-2 border rounded-md" id="query-output"/>
      </div>
    </div>
    <Button on:click={
    () => {
      navigator.clipboard.writeText(queryOutput)
      toast.success('Copied!')
    }} class="w-full">Copy</Button>
  </div>
{/if}