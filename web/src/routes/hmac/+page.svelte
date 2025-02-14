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
  import { runPython } from '$lib/pyodide/bridge';
  import {
    saveB64AsBinary,
    loadExternalFileAsBytes,
    getClientCode,
  } from '$lib/pyodide/bridge';
	import { toast } from 'svelte-sonner';

  let pyodide: any;
  let loading = true;
  let messageIn: string = '';
  let secret: string = '1t\'s @ s3cr3t!';
  let messageOut: string = '';
  let code: string = '';
  const getDigestCode = (key: string, message: string) => `
  from func import HMACHelper
  helper = HMACHelper("${key}", "sha256")
  digest = helper.generate_hmac("${message}")
  `
  const getVerifyCode = (key: string, message: string, digest: string) => `
  from func import HMACHelper
  helper = HMACHelper("${key}", "sha256")
  is_valid = helper.verify_hmac("${message}", "${digest}")
  `

  const doDigest = async (
    messageIn: string,
    secret: string,
  ) => {
    if (messageIn === '') {
      toast.error('Message is empty')
      return
    }
    if (secret === '') {
      toast.error('Secret is empty')
      return
    }
    try {
      code = getDigestCode(secret, messageIn)
      await runPython(
        pyodide,
        code,
      );
      const test = pyodide.globals.get('digest')
      messageOut = test.toString()
      toast.success('Digest generated')
    } catch (error) {
      toast.error('Failed to run')
    }
  }

  const doVerify = async (
    messageIn: string,
    secret: string,
    messageOut: string,
  ) => {
    if (messageIn === '') {
      toast.error('Message is empty')
      return
    }
    if (secret === '') {
      toast.error('Secret is empty')
      return
    }
    if (messageOut === '') {
      toast.error('Digest is empty')
      return
    }
    try {
      code = getVerifyCode(secret, messageIn, messageOut)
      await runPython(
        pyodide,
        code,
      );
      const test = pyodide.globals.get('is_valid')
      if (test) {
        toast.success('Digest verified')
      } else {
        toast.error('Digest not verified')
      }
    } catch (error) {
      toast.error('Failed to run')
    }
  }

  const serviceName = 'hmac'

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
          toast.success('Ready!')
      } catch (error) {
          toast.error('Pyodide: Failed to load')
      }
  });
</script>
<div class="flex flex-col justify-between space-y-2">
  <div class="pb-2">
    <a href="https://ko.wikipedia.org/wiki/HMAC" target="_blank">
      <h1 class="text-2xl font-bold">
        Hash-based Message Authentication Code (HMAC)
      </h1>
    </a>
  </div>
  <div class="bg-gray-100 p-4 rounded-md">
    <code lang="plaintext">
      HMAC(K, m) = H((K ⊕ opad) || H((K ⊕ ipad) || m))
    </code>
  </div>
  <div class="flex flex-col space-y-2 pt-4">
    <h2 class="text-xl font-bold">Plain Text</h2>
    <Textarea
      bind:value={messageIn}
      placeholder="Enter message"
    />
    <h2 class="text-xl font-bold">Secret</h2>
    <Textarea
      bind:value={secret}
      placeholder="Enter secret"
    />
    <h2 class="text-xl font-bold">Digest</h2>
    <Textarea
      bind:value={messageOut}
      placeholder="Digest"
    />
  </div>
  <div class="flex space-x-2 pt-4">
    <Button
      disabled={loading}
      class="w-1/2"
      on:click={async () => {
        await doDigest(messageIn, secret)
      }}
    >
      Run
    </Button>
    <Button
      disabled={loading}
      class="w-1/4"
      on:click={() => {
        if (messageOut === '') {
          toast.error('Digest is empty')
          return
        }
        navigator.clipboard.writeText(messageOut)
        toast.success('Copied')
      }}
    >
      Copy
    </Button>
    <Button
      disabled={loading}
      class="w-1/4"
      on:click={async() => {
        await doVerify(messageIn, secret, messageOut)
      }}
    >
      Verify
    </Button>
  </div>
</div>