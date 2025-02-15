<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { toast } from 'svelte-sonner';
  import { loadPyodide } from 'pyodide';
  import bcrypt from 'bcryptjs'
	import Input from '$lib/components/ui/input/input.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import { PYODIDE_URL } from '$lib/constants';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';

  let pyodide: any;
  let loading = true;
  const acceptedFileTypes = ".csv,.json,.jsonl";
  let selectedFileName = "Upload CSV or JSON file";
  let bcryptFileMode = false;
  const inputPlainText = writable('');
  const inputFilePlainText = writable('');
  const outputHash = writable('');
  const bcryptDisabledStyle = 'text-md font-bold text-gray-500'
  const bcryptEnabledStyle = 'text-md font-bold text-gray-900'

  const hashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  }

  const handleHashPassword = async () => {
    if ($inputPlainText === '') {
      $outputHash = '';
      return;
    }
    $outputHash = await hashPassword($inputPlainText);
  }

  const handleFileSelect = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;

    const toastId = toast.loading('Preparing...', {
      duration: Infinity
    });

    const file = input.files[0];
    selectedFileName = file.name;

    const reader = new FileReader();

    reader.onload = async (e) => {
      if (!e.target) {
        toast.error('파일을 읽을 수 없습니다', {
          id: toastId,
          duration: 3000
        });
        return;
      }

      const text = e.target.result as string;
      $inputFilePlainText = text;

      try {
        toast.loading('In Progress...', {
          id: toastId
        });

        await parseAndReturn(text);

        toast.success('Done!', {
          id: toastId,
          duration: 3000
        });
      } catch (error) {
        console.error(error);
        toast.error('Failed to process file', {
          id: toastId,
          duration: 3000
        });
      }
    };

    reader.onerror = () => {
      toast.error('Failed to read file', {
        id: toastId,
        duration: 3000
      });
    };

    reader.readAsText(file);
  };
  const parseAndReturn = async (data: string) => {
    const dateNow = new Date()
      .toISOString()
      .replace(/[-:.]/g, '')
      .replace('T', '-')
      .split('.')[0];

    pyodide.globals.set("data", data);
    pyodide.globals.set("file_fullname", selectedFileName);
    pyodide.globals.set("now", dateNow);

    try {
      await pyodide.runPythonAsync(`
        import pyodide
        import pandas as pd
        import bcrypt
        import json
        import io

        file_name, file_type = file_fullname.rsplit('.', 1)

        if file_type == 'json':
          df = pd.read_json(io.StringIO(data))
        if file_type == 'jsonl':
          df = pd.read_json(io.StringIO(data), lines=True)
        elif file_type == 'csv':
          df = pd.read_csv(io.StringIO(data))

        def hash_password(password):
          password_str = str(password)
          salt = bcrypt.gensalt()
          hashed = bcrypt.hashpw(password_str.encode('utf-8'), salt)
          return hashed.decode('utf-8')

        if 'password' in df.columns:
          df['password'] = df['password'].apply(hash_password)

        # fileType에 따라 다른 파일로 저장
        if file_type == 'json':
          df.to_json(f'/tmp/{file_name}-hashed-{now}.json', orient='records', lines=False)
        elif file_type == 'jsonl':
          df.to_json(f'/tmp/{file_name}-hashed-{now}.jsonl', orient='records', lines=True)
        elif file_type == 'csv':
          df.to_csv(f'/tmp/{file_name}-hashed-{now}.csv', index=False)
      `);

      // pyodide 스토리지에 저장된 파일을 가져와서 다운로드
      const fileName = pyodide.globals.get('file_name');
      const fileType = pyodide.globals.get('file_type');
      const fileData = await pyodide.runPythonAsync(`open(f'/tmp/${fileName}-hashed-${dateNow}.${fileType}', 'r').read()`);
      const blob = new Blob([fileData], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}-hashed-${dateNow}.${fileType}`;
      a.click();
      URL.revokeObjectURL(url);

      return true; // promise resolve
    } catch (error) {
      console.error(error);
      throw new Error('Failed to process file');
    }
  };

  onMount(async () => {
    pyodide = await loadPyodide({indexURL: PYODIDE_URL});
    await pyodide.loadPackage(['pandas']);  // pandas 패키지 로드
    await pyodide.loadPackage(['bcrypt']);  // bcrypt 패키지 로드
    loading = false;
  });
</script>

<div class="flex space-x-2 items-end align-bottom space-x-2">
  <h2 class="text-lg font-bold">Bcrypt</h2>
  <div class="flex items-center space-x-2">
    <button
      class={!bcryptFileMode ? bcryptEnabledStyle : bcryptDisabledStyle}
      on:click={() => {bcryptFileMode = false}}
    >
      Text
    </button>
    <button
      class={bcryptFileMode ? bcryptEnabledStyle : bcryptDisabledStyle}
      on:click={() => {bcryptFileMode = true}}
    >
      File
    </button>
  </div>
</div>
{#if bcryptFileMode === true && !loading}
<div class="flex flex-col space-y-2">
  <div class="flex items-center space-x-2">
    <h2 class="text-xm font-bold">File</h2>
  </div>
  <div class="flex space-x-2">
    <div class="w-30">
      <AlertDialog.Root>
        <AlertDialog.Trigger>
          <Button type="button" variant="secondary" size="sm" class="w-full">
            ❓
          </Button>
        </AlertDialog.Trigger>
        <AlertDialog.Portal>
          <AlertDialog.Overlay />
          <AlertDialog.Content class="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg md:w-full">
            <AlertDialog.Header>
              <AlertDialog.Title class="text-lg font-semibold">파일 형식 안내</AlertDialog.Title>
              <AlertDialog.Description class="mt-2 text-sm text-muted-foreground">
                <pre class="p-4 bg-muted rounded-md whitespace-pre-line">
                  # 지원되는 파일 형식

                  - CSV 파일 (.csv)
                  - JSON 파일 (.json)
                  - JSON Lines 파일 (.jsonl)

                  파일 내 'password' 컬럼이 있는 경우 해당 값들이 bcrypt로 해시화됩니다.
                </pre>
              </AlertDialog.Description>
            </AlertDialog.Header>
            <AlertDialog.Footer>
              <AlertDialog.Action>
                <Button>확인</Button>
              </AlertDialog.Action>
            </AlertDialog.Footer>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
    <div class="w-full">
      <label for="file-upload" class="cursor-pointer">
        <input
          id="file-upload"
          type="file"
          class="hidden w-full"
          accept={acceptedFileTypes}
          on:change={handleFileSelect}
        />
        <Button
          class='w-full'
          type="button"
          variant="secondary"
          size="sm"
          on:click={() => {
            const input = document.getElementById('file-upload') as HTMLInputElement;
            input.click();
          }}
        >
          {selectedFileName}
        </Button>
      </label>
    </div>
  </div>
</div>
{:else if bcryptFileMode === true && loading}
<Skeleton class="w-1/3 h-4" />
<Skeleton class="w-full h-10" />
{:else}
<div class="flex">
  <div class="flex flex-col space-y-2 w-1/2 pr-2">
    <div class="flex items-center space-x-2">
      <h2 class="text-xm font-bold">Plain Text</h2>
    </div>
    <Input
      id="bcrypt-in"
      placeholder="Enter plain text"
      bind:value={$inputPlainText}
      on:input={handleHashPassword}
    />
  </div>
  <div class="flex flex-col space-y-2 w-1/2 pl-2">
    <h2 class="text-xm font-bold">Hash</h2>
    <Input
      id="bcrypt-out"
      readonly
      placeholder="Hash, click to copy"
      on:click={() => {
        navigator.clipboard.writeText($outputHash)
        toast.success('Copied to clipboard')
      }}
      bind:value={$outputHash}
    />
  </div>
</div>
{/if}
