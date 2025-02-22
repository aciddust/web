<script lang="ts">
  import { onMount } from 'svelte';
  import { loadPyodide } from 'pyodide';
  import { Skeleton } from '$lib/components/ui/skeleton';
  import { Textarea } from '$lib/components/ui/textarea';
  import { Button } from '$lib/components/ui/button';
  import { PYODIDE_URL } from '$lib/constants';

  import { runPython } from '$lib/pyodide/bridge';
	import { toast } from 'svelte-sonner';
	import Input from '$lib/components/ui/input/input.svelte';
  import * as Carousel from "$lib/components/ui/carousel/index.js";
	import Label from '$lib/components/ui/label/label.svelte';
	import { openNewTab } from '$lib/utils';


  let pyodide: any;
  let loading = true;


  let inputMessage: string;
  let inputFile: File | undefined;
  let inputDecryptionFile: File | undefined;
  let inputImageBytes: Blob | undefined;
  let inputDecryptionBytes: Blob | undefined;
  let outputDecryptionBytes: Blob | undefined;
  let outputImageBytes: any;
  let outputMessage: string;
  let encrypted: boolean = false;
  let decrypted: boolean = false;

  onMount(async () => {
      let isOkay: boolean = false;
      toast.loading('Loading...');
      try {
          pyodide = await loadPyodide({indexURL: PYODIDE_URL});
          await pyodide.loadPackage('micropip');
          const micropip = pyodide.pyimport('micropip');
          await micropip.install('binjector==0.1.10');
          loading = false;
          isOkay = true;
      } catch (error) {
          toast.error('Pyodide: Failed to load')
      }
      toast.dismiss();
      if (isOkay) toast.success('Ready!')
      else toast.error('Failed to load binjector');
  });

  const encrypt = async (
    pyodide: any,
    imageFile: File | undefined,
    message: string,
  ) => {
    if (!pyodide || !imageFile) {
      return
    }
    const toastId = await toast.loading('Encrypting ...');
    const reader = new FileReader();
    reader.readAsArrayBuffer(imageFile);

    reader.onload = async () => {
      const arrayBuffer = reader.result;
      const bytes = new Uint8Array(arrayBuffer as ArrayBuffer);
      const code = `
        from binjector.steganography import Steganography
        s = Steganography()
        image_bytes = bytes([${bytes}]) # Uint8Array to Python bytes
        message = '''${message}'''
        result = s.hide_message_for_web(image_bytes, message)
        result
      `;
      await runPython(pyodide, code).then((result) => {
        outputImageBytes = new Uint8Array(result.toJs());
        console.debug(outputImageBytes)
        encrypted = true;
        toast.dismiss(toastId);
        toast.success('Encrypted');
      }).catch((error) => {
        console.error(error);
        encrypted = false;
        toast.dismiss(toastId);
        toast.error('Encryption failed');
      });
    };
  }
  const switchToDecryption = () => {
    encrypted = false;
    inputDecryptionBytes = outputImageBytes;
    console.log(typeof(inputDecryptionBytes))
    console.log(inputDecryptionBytes)
    // switch to next carousel item
    const next = document.getElementById('carousel-next');
    if (next) {
      next.click();
    }
  }
  const reset = () => {
    encrypted = false;
    decrypted = false;
    inputMessage = '';
    inputFile = undefined;
    inputImageBytes = undefined;
    inputDecryptionBytes = undefined;
    outputImageBytes = undefined;
    outputDecryptionBytes = undefined;
    inputDecryptionFile = undefined;
    outputMessage = '';

    // switch to first carousel item
    const prev = document.getElementById('carousel-prev');
    if (prev) {
      prev.click();
    }
  }
  const decrypt = async (pyodide: any, image: Blob | undefined) => {
    if (!pyodide || !image) {
      return
    }
    const toastId = await toast.loading('Decrypting ...');

    const code = `
      from binjector.steganography import Steganography
      s = Steganography()
      image_bytes = bytes([${image}]) # Uint8Array to Python bytes
      result = s.seek_message_for_web(image_bytes)
      result
    `;
    await runPython(pyodide, code).then((result) => {
      outputMessage = result;
      toast.dismiss(toastId);
      toast.success('Message decrypted');
      decrypted = true;
    }).catch((error) => {
      console.error(error);
      toast.dismiss(toastId);
      toast.error('Failed to decrypt message or no message found');
    });
  }

  const decryptFile = async (pyodide: any, imageFile: File | undefined) => {
      if (!pyodide || !imageFile) {
          return;
      }
      try {
          const arrayBuffer = await imageFile.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          pyodide.globals.set('pyBytes', uint8Array);
          const code = `
          import io
          from binjector.steganography import Steganography
          s = Steganography()
          print(type(pyBytes))
          py_bytes = pyBytes.to_py()
          print(type(py_bytes))
          result = s.seek_message_for_web(py_bytes)
          result
          `;
          const result = await pyodide.runPythonAsync(code);

          outputMessage = result;
          toast.success('Message decrypted');
          decrypted = true;
      } catch (error) {
          console.error(error);
          toast.error('Failed to decrypt message or no message found');
      }
  };

</script>

<div class="space-y-4 pl-4 pr-4 items-center justify-center" style="display: flex; align-items: flex-end;">
  <a
    href="https://pypi.org/project/binjector/"
    target="_blank"
    rel="noopener noreferrer"
    class="flex items-end text-2xl font-semibold inline-block"
  >Binjector</a>
  <button
    type="button"
    class="flex items-center justify-center h-8 ml-2 p-0 border-0 bg-transparent cursor-pointer"
    on:click={() => openNewTab('https://github.com/dev4hobby/image-steganography/tree/main/binjector')}
    on:keydown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        openNewTab('https://github.com/dev4hobby/image-steganography/tree/main/binjector');
      }
    }}
  >
    <img src="/github-mark.svg" alt="Binjector" class="h-8" />
  </button>
</div>

{#if loading}
  <div class="flex justify-center">
    <div class="flex flex-col space-y-4 w-1/2">
      <!-- Header Skeleton -->
      <div class="flex flex-col space-y-2 p-4">

        <!-- Input Section Skeleton -->
        <div class="flex flex-col space-y-2">
          <Skeleton class="h-6 w-32" /> <!-- Section title -->
          <div class="flex space-x-4">
            <Skeleton class="h-64 w-full" /> <!-- Message input area -->
            <Skeleton class="h-64 w-full" /> <!-- Image upload area -->
          </div>
        </div>

        <!-- Output Section Skeleton -->
        <div class="flex flex-col space-y-2">
          <Skeleton class="h-6 w-32" /> <!-- Section title -->
          <Skeleton class="h-64 w-full" /> <!-- Output image area -->
        </div>

        <!-- Buttons Skeleton -->
        <div class="flex space-x-4">
          <Skeleton class="h-10 w-full" />
        </div>
      </div>
    </div>
  </div>
{:else}
  <div class="flex space-y-4 pl-4 pr-4 items-center justify-center">
    <Carousel.Root>
      <Carousel.Content>
        <Carousel.Item> <!-- page for encryption -->
          <div class="flex flex-col space-y-2 p-4">
            <h3 class="text-lg font-semibold">Encryption: Input</h3>
            <div class="w-full h-64 rounded-lg flex items-center justify-center">
              <div class="flex w-full space-x-2 h-20 items-center justify-center">
                <Textarea class='w-full h-64' bind:value={inputMessage} placeholder="Message" />
                <div class="w-full item-center justify-center flex">
                <label for="input-image" class="w-full h-64 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/50">
                {#if inputFile}
                  <img src={URL.createObjectURL(inputFile)} alt="Selected" class="max-h-full max-w-full object-contain" />
                {:else}
                  <div class="text-center">
                    <p class="text-sm text-muted-foreground">Click to upload image</p>
                    <p class="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
                  </div>
                {/if}
                <Input type="file" accept="image/jpeg, image/png" id="input-image" class="hidden" on:change={
                  async (e) => {
                  if (!e.target) {return}
                  const input = e.target as HTMLInputElement;
                  inputFile = input.files?.[0]}
                  } />
                </label>
                </div>
              </div>
            </div>
            <div class="h-4"> </div>
            <h3 class="text-lg font-semibold">Output</h3>
            <div class="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
              {#if outputImageBytes}
                <img src={URL.createObjectURL(new Blob([outputImageBytes]))} alt="Output" class="max-h-full max-w-full object-contain" />
              {:else}
                <span class="text-muted-foreground">No image generated</span>
              {/if}
            </div>
            <hr class="my-4" />
            <div class="flex space-x-4">
              {#if encrypted}
                <Button class="w-full" on:click={() => {
                  // download the image
                  const blob = new Blob([outputImageBytes], {type: 'image/png'});
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'output.png';
                  a.click();
                  URL.revokeObjectURL(url);
                }}>Download</Button>
                {:else}
                <Button class="w-full" on:click={
                  async () => {
                    await encrypt(pyodide, inputFile, inputMessage);
                  }
                }>Submit</Button>
              {/if}
              {#if encrypted}
                <Button class="w-full" on:click={() => switchToDecryption()}>Decrypt?</Button>
              {/if}
            </div>
          </div>
        </Carousel.Item>

        <Carousel.Item> <!-- page for decryption -->
          <div class="flex flex-col space-y-2 p-4">
            <h3 class="text-lg font-semibold">Decryption: Input</h3>
            <div class="w-full h-64 rounded-lg flex items-center justify-center">
              <div class="flex w-full space-x-2 h-20 items-center justify-center">
                <div class="w-full item-center justify-center flex">
                <label for="input-decryption-image" class="w-full h-64 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/50">
                {#if inputDecryptionBytes}
                  <img src={URL.createObjectURL(new Blob([inputDecryptionBytes]))} alt="Selected" class="max-h-full max-w-full object-contain" />
                {:else if inputDecryptionFile}
                  <img src={URL.createObjectURL(inputDecryptionFile)} alt="Selected" class="max-h-full max-w-full object-contain" />
                {:else}
                  <div class="text-center">
                    <p class="text-sm text-muted-foreground">Waiting ...</p>
                    <p class="text-xs text-muted-foreground mt-1">Pass from Encryption stage</p>
                  </div>
                {/if}
                <Input type="file" disabled accept="image/jpeg, image/png" id="input-decryption-image" class="hidden" on:change={
                  async (e) => {
                  if (!e.target) {return}
                  const input = e.target as HTMLInputElement;
                  inputDecryptionFile = input.files?.[0]}
                  } />
                </label>
                </div>
              </div>
            </div>
            <div class="h-4"> </div>
            <h3 class="text-lg font-semibold">Output</h3>
            <div class="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
              <Textarea class='w-full h-64' bind:value={outputMessage} placeholder="Waiting ..." disabled={true} />
            </div>
            <hr class="my-4" />
            <div class="flex space-x-4">
              {#if !decrypted}
                <Button
                  class="w-full"
                  on:click={() => {
                    if (inputDecryptionBytes) {
                      decrypt(pyodide, inputDecryptionBytes)
                    } else if (inputDecryptionFile) {
                      decryptFile(pyodide, inputDecryptionFile)
                    } else {
                      toast.error('No image selected')
                    }
                  }}
                  disabled={!inputDecryptionBytes && !inputDecryptionFile}
                >Submit</Button>
              {:else}
              <Button class="w-full" on:click={() => {
                navigator.clipboard.writeText(outputMessage);
                toast.success('Copied to clipboard');
              }}>Copy</Button>
              {/if}
              {#if decrypted}
                <Button class="w-full" on:click={() => reset()}>Reset?</Button>
              {/if}
            </div>
          </div>
        </Carousel.Item>

      </Carousel.Content>
      <Carousel.Previous id='carousel-prev'/>
      <Carousel.Next id='carousel-next'/>
    </Carousel.Root>
  </div>
{/if}