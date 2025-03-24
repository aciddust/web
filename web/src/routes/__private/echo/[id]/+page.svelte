<script lang="ts">
  import { page } from '$app/state';
  import { onMount, onDestroy } from 'svelte';
  import { writable } from 'svelte/store';
	import { goto } from '$app/navigation';
	import {
    Button,
  } from "$lib/components/ui/button/index.js";
  import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
  import X from 'lucide-svelte/icons/x';
  import BadgeAlert from 'lucide-svelte/icons/badge-alert';
  import * as Dialog from "$lib/components/ui/dialog/index.js";
	import { toast } from 'svelte-sonner';
  import { slide } from 'svelte/transition';
  import { createClient, RealtimeChannel } from '@supabase/supabase-js';
	import { Input } from '@/components/ui/input';

  export let data: { props: { id: string; supabaseUrl: string; supabasePassword: string } };

  let id = page.params.id
  let messages = writable<Array<[string, string]>>([]);
  let supabase: ReturnType<typeof createClient>
  let channel: RealtimeChannel
  let isProcessing = false;
  let messageInput = '';

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
  let siteProtocol: string;

  const sendMessage = async (message?: string) => {
    channel?.send({
      type: 'broadcast',
      event: 'message',
      payload: {
        timestamp: new Date().toISOString(),
        message: message ?? messageInput,
      }
    })
  }

  const handleSendMessage = async (message?: string) => {
    if (!messageInput.trim()) return;

    const messageToSend = message ?? messageInput; // 현재 입력값 저장
    isProcessing = true;

    try {
      await sendMessage(messageToSend);
      // 메시지 전송 후 입력창 초기화
      messageInput = '';

      // 로컬에서 메시지 표시 (옵션)
      messages.update(m => [...m, [new Date().toISOString(), messageToSend]]);
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      toast.error('메시지 전송에 실패했습니다');
    } finally {
      isProcessing = false;
    }
  };

  const cleanUp = async () => {
    await channel?.unsubscribe();
    await supabase?.removeChannel(channel);
  };

  onMount(() => {
    if (window) {
      siteHost = window.location.host;
      siteProtocol = window.location.protocol;
    }
    supabase = createClient(data.props.supabaseUrl, data.props.supabasePassword);
    channel = supabase.channel(`chat#${id}`);

    // 채널 메시지 수신 부분 수정
    channel.on('broadcast', { event: 'message' }, (payload) => {
      // 수신된 메시지 구조 확인 및 파싱
      console.log('Received payload:', payload);

      // 타임스탬프와 메시지 추출
      const timestamp = payload.payload?.timestamp || new Date().toISOString();
      let message = payload.payload?.message || '';

      // JSON 문자열이라면 파싱 시도
      try {
        if (typeof message === 'string' && message.startsWith('{') && message.endsWith('}')) {
          const parsed = JSON.parse(message);
          if (parsed.text) {
            message = parsed.text;
          } else if (parsed.data?.message) {
            message = parsed.data.message;
          }
        }
      } catch (e) {
        // 파싱 실패 시 원본 메시지 사용
        console.log('Failed to parse message:', e);
      }

      // 메시지 저장
      messages.update(m => [...m, [timestamp, message]]);
    });

    channel.subscribe();
  });

  onDestroy(() => {
    cleanUp();
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
          <pre class='pt-2 font-bold text-sm overflow-x-auto'>{siteHost}/api/chat/{id}</pre>
          <p class="text-sm">json 형식의 데이터를 POST 요청하면</p>
          <p class='pb-2 text-sm'>이 스페이스에 메시지가 추가됩니다.</p>
          <Button on:click={() => {
            const curl = `curl -X POST ${siteProtocol}//${siteHost}/api/__private/chat/${id} -H "Content-Type: application/json" -d '${JSON.stringify(VALUE_EXAMPLE())}'`;
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
            {siteHost}/api/chat
          </p>
          <p>
            Content-Type: application/json
          </p>
          </div>
          <p class='pt-2 text-xs'>메시지는 3초마다 자동으로 갱신됩니다.</p>
          <p class="text-xs">만료된 스페이스는 더이상 사용할 수 없습니다.</p>
        </Dialog.Description>
          </Dialog.Header>
          <Dialog.Footer class="flex justify-center items-center text-center align-center">
        <div class="w-full flex justify-center items-center">
          <Button on:click={() => {
            toast.promise(
              (async () => {
                try {
                  // messageInput 검사를 건너뛰고 직접 전송
                  const message = "테스트 메시지";
                  isProcessing = true;
                  await sendMessage(message);
                  // 로컬에서도 메시지 표시
                  messages.update(m => [...m, [new Date().toISOString(), message]]);
                  isProcessing = false;
                  return "완료";
                } catch (error) {
                  isProcessing = false;
                  throw error;
                }
              })(),
              {
                loading: '메시지 전송중...',
                success: '메시지 전송 완료',
                error: '메시지 전송 실패',
              }
            );
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
        <Button
          builders={[builder]}
          variant="outline"
          style="visibility: hidden;"
        ><X/></Button>
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
            await cleanUp();
            goto('/echo');
          }}>제거하기</AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog.Root>
  </nav>
  <div class="content">
    <div class="chat-messages">
      {#each $messages as [timestamp, message], i (timestamp)}
        <div class="message" transition:slide>
          <div class="message-bubble">
            {message}
          </div>
          <div class="message-time">
            {new Date(timestamp).toLocaleString()}
          </div>
        </div>
      {/each}
    </div>
    <!-- 하단에 메시지 입력, 전송버튼 추가 -->
  </div>
  <div class="input-area pb-4">
    <div class="flex space-x-1">
      <Input
        bind:value={messageInput}
        placeholder="메시지를 입력하세요 (⌘ + Enter)"
        on:keydown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            setTimeout(() => handleSendMessage(
              messageInput
            ), 0);
          }
        }}
        class="message-input"
      />
      <Button
        disabled={!messageInput.trim() || isProcessing}
        on:click={
          () => {
            handleSendMessage(
              messageInput
            )
          }
        }
        class="send-button"
      >
        전송
      </Button>
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