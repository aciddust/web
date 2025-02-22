<!-- 이름, 이메일, 전화번호, 문의내용, 전송 버튼 -->
<script lang="ts">
  import { toast } from 'svelte-sonner';
  import { writable } from 'svelte/store';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Button from '$lib/components/ui/button/button.svelte';

  const name = writable('');
  const email = writable('');
  const content = writable('');

  const contentExample = `
  사용중 불편한 점이 있거나 원하시는 개선 사항이 있으시면 입력해주세요.
  가능한 빠르게 반영하도록 노력하겠습니다.

  If you have any problems or suggestions for improvement, please let us know.
  We'll try to address them as soon as possible.
  `;

  const sendFeedback = async (data: { name: string; email: string; content: string }) => {
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to send feedback');
    }
  };

  async function submitFeedback() {
    if ($name === '' || $email === '' || $content === '') {
      toast.error('Please fill out all fields');
      return;
    }

    // email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test($email)) {
      toast.error('Invalid email');
      return;
    }

    // content validation
    if ($content.length < 10) {
      toast.error('Content must be at least 10 characters');
      return;
    }

    toast.promise(
      sendFeedback({
        name: $name,
        email: $email,
        content: $content,
      }).then(() => {
        $name = '';
        $email = '';
        $content = '';
      }).catch(() => {}),
      {
        loading: 'Sending feedback...',
        success: 'Feedback sent',
        error: 'Failed to send feedback',
      }
    );
  }
</script>

<div class="container">
  <div class="flex flex-col space-y-4">
    <div class="flex flex-col space-y-2">
      <h1 class="text-2xl font-bold">Feedback</h1>
    </div>
    <div class="flex w-full space-x-4">
      <div class="flex w-full flex-col space-y-2">
        <h2 class="text-lg font-bold">Name</h2>
        <Input
          placeholder="김햄부기온앤온"
          id="name" type="text" class="input" bind:value={$name}
        />
      </div>
      <div class="flex w-full flex-col space-y-2">
        <h2 class="text-lg font-bold">Email</h2>
        <!-- validate email -->
        <Input
          placeholder="example@email.com"
          id="email" type="email" class="input" bind:value={$email}
        />
      </div>
    </div>
    <div class="flex w-full space-x-4">
      <div class="flex w-full flex-col space-y-2">
        <h2 class="text-lg font-bold">Content</h2>
        <Textarea
            placeholder={contentExample}
          id="content" class="input h-80" bind:value={$content}
        />
      </div>
    </div>
    <Button on:click={submitFeedback}>Submit</Button>
  </div>
</div>
