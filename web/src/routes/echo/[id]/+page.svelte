<script lang="ts">
  import { page } from '$app/state';
  import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import {
    Button,
    buttonVariants
  } from "$lib/components/ui/button/index.js";
  import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
  import X from 'lucide-svelte/icons/x';
  import BadgeAlert from 'lucide-svelte/icons/badge-alert';
  import * as Dialog from "$lib/components/ui/dialog/index.js";
	import { toast } from 'svelte-sonner';
  import { slide } from 'svelte/transition';
	import { Separator } from '@/components/ui/menubar';

  let id = page.params.id
  let messages: Array<[string, string]> = [];
  let lastMessageTs = '-';
  let intervalId: NodeJS.Timeout | undefined;
  let expired = false;

  const VALUE_EXAMPLE = () => {
    return {
      type: 'json',
      data: {
        message: 'Hello, World!',
        from: 'echo',
        when: new Date().toISOString()
      }
    }
  }

  // this site host
  let siteHost: string;

  async function fetchMessages() {
    try {
      const response = await fetch(`/api/echo/${id}?begin=${lastMessageTs}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('echo-token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const newMessages = await response.json();
      if (newMessages.length > 0) {
        messages = [...messages, ...newMessages];
        lastMessageTs = newMessages[newMessages.length - 1][0].split('-')[0] + '-999';
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('메시지를 가져오는데 실패했습니다');
      expired = true;
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = undefined;
      }
    }
  }

  const cleanUp = async () => {
    const response = await fetch(`/api/echo/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('echo-token')}`,
      },
    });
    goto('/echo');
  }

  const sendMessage = async () => {
    const response = await fetch(`/api/echo/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('echo-token')}`,
      },
      body: JSON.stringify(VALUE_EXAMPLE())
    });
    if (!response.ok) {
      toast.error('메시지 전송에 실패했습니다');
    }
  }

  onMount(() => {
    if (window) {
      siteHost = window.location.host
    }
    fetchMessages();
    intervalId = setInterval(fetchMessages, 3000);
  });
  onDestroy(() => {
    // 컴포넌트가 제거될 때 interval 정리
    if (intervalId) clearInterval(intervalId);
  });
</script>


<div class="container">
  <nav class="navigation">
    <button class="back-button" on:click={() => {
      goto('/echo');
    }}>←</button>
    <div class="title flex align-center space-x-1">
      <p class="font-bold">{id}</p>
      <Dialog.Root>
        <Dialog.Trigger>
          <BadgeAlert/>
        </Dialog.Trigger>
        <Dialog.Content class="sm:max-w-[425px] max-w-[90vw] w-full">
          <Dialog.Header>
        <Dialog.Title class="pb-4">Echo Test</Dialog.Title>
        <Dialog.Description class="space-y-1 text-center">
          <pre class='pt-2 font-bold text-sm overflow-x-auto'>{siteHost}/api/echo/{id}</pre>
          <p class="text-sm">json 형식의 데이터를 POST 요청하면</p>
          <p class='pb-2 text-sm'>이 스페이스에 메시지가 추가됩니다.</p>
          <Button on:click={() => {
          const localEchoToken = localStorage.getItem('echo-token');
          if (!localEchoToken) {
            toast.error('토큰이 없습니다. 페이지 새로고침 후 다시 시도해주세요');
            return;
          }
          navigator.clipboard.writeText(localEchoToken);
          toast.success('토큰이 복사되었습니다');
            }}
            variant="outline"
            class="text-xs"
          >
            Token
          </Button>
          <Button on:click={() => {
            const localEchoToken = localStorage.getItem('echo-token');
            if (!localEchoToken) {
          toast.error('토큰이 없습니다. 페이지 새로고침 후 다시 시도해주세요');
          return;
            }
            const curl = `curl -X POST ${siteHost}/api/echo/${id} -H "Content-Type: application/json" -H "Authorization: Bearer ${localEchoToken}" -d '${JSON.stringify(VALUE_EXAMPLE())}'`;
            navigator.clipboard.writeText(curl);
            toast.success('쉘에서 스크립트를 실행해보세요');
            }}
            variant="outline"
            class="text-xs"
          >
            Curl
          </Button>
          <div class="pt-4"></div>
            <div class="p-2 text-left break-words rounded-md bg-gray-100 text-xs">
          <p>
            POST
          </p>
          <p class="break-words">
            {siteHost}/api/echo
          </p>
          <p>
            Content-Type: application/json
          </p>
          <p class="break-all">
            Authorization: Bearer {localStorage.getItem('echo-token')}
          </p>
          </div>
          <p class='pt-2 text-xs'>메시지는 3초마다 자동으로 갱신됩니다.</p>
          <p class="text-xs">만료된 스페이스는 더이상 사용할 수 없습니다.</p>
        </Dialog.Description>
          </Dialog.Header>
          <Dialog.Footer class="flex justify-center items-center text-center align-center">
        <div class="w-full flex justify-center items-center">
          <Button on:click={() => {
            toast.promise(sendMessage(), {
          loading: '메시지 전송중...',
          success: '메시지 전송 완료',
          error: '메시지 전송 실패'
            });
          }}
          class="text-sm">
            Send Message
          </Button>
        </div>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    </div>
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild let:builder>
        <Button builders={[builder]} variant="outline"><X/></Button>
      </AlertDialog.Trigger>
      <AlertDialog.Content>
        <AlertDialog.Header>
          <AlertDialog.Title>이 스페이스를 제거할까요?</AlertDialog.Title>
          <AlertDialog.Description>
            제거하면 다시 접근할 수 없습니다.
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Cancel>취소</AlertDialog.Cancel>
          <AlertDialog.Action on:click={async () => {
            expired = true;
            await cleanUp();
          }}>제거하기</AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog.Root>
  </nav>
  <div class="content">
    <div class="chat-messages">
      <!-- messages 를 반복문사용하여 랜더링, 그런데 각 message는 0번째가 timestamp, 1번째가 text로 되어있음 -->
      {#each messages as [ts, text]}
      <div class="message" transition:slide>
        {#if JSON.parse(text[1]).type === "json"}
        <div class="message-bubble">
          <pre class="json-content overflow-x-auto whitespace-pre-wrap break-words">{JSON.stringify(JSON.parse(JSON.parse(text[1]).text), null, 2)}</pre>
        </div>
        {:else if JSON.parse(text[1]).type === "text"}
        <div class="message-bubble overflow-hidden break-words">{JSON.parse(text[1]).text}</div>
        {/if}
        <div class="message-time">{new Date(parseInt(ts.split('-')[0]))}</div>
      </div>
      {/each}
      {#if expired}
      <div class="message">
        <div class="message-bubble">이 스페이스는 만료되었습니다.</div>
        <div class="message-time">{new Date()}</div>
      </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    height: 80vh;
    max-width: 600px;
    margin: 0 auto;
    border: 1px solid #eaeaea;
  }
  .navigation {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #eaeaea;
    background-color: #f9f9f9;
  }
  .title {
    font-weight: bold;
  }
  .back-button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
  }
  .content {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column-reverse;
  }
  .chat-messages {
    display: flex;
    flex-direction: column;
  }
  .message {
    margin: 8px 0;
    display: flex;
    flex-direction: column;
  }
  .message-bubble {
    background-color: #f0f0f0;
    padding: 8px 12px;
    border-radius: 12px;
    max-width: 80%;
    word-wrap: break-word;
  }
  .message-time {
    font-size: 0.8em;
    color: #666;
    margin-top: 4px;
  }
</style>