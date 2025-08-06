<script lang="ts">
  import * as DialogPrimitive from "$lib/components/ui/dialog/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Textarea } from "$lib/components/ui/textarea/index.js";
  import { toast } from "svelte-sonner";
	import type { Writable } from "svelte/store";

  export let dialogOpen: Writable<boolean>;
  let submitting: boolean = false;

  let name: string = '';
  let email: string = '';
  let content: string = '';


  async function handleFeedbackSubmit() {
    if (!name || !email || !content) {
      toast.error('Please fill out all fields');
      return;
    }
    submitting = true;

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          content,
        }),
      })
      if (response.ok) {
        toast.success('Feedback submitted');
        $dialogOpen = false;
        name = '';
        email = '';
        content = '';
      } else {
        toast.error('Failed to submit feedback');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit feedback');
    } finally {
      submitting = false;
    }
  }

</script>

<DialogPrimitive.Root
  bind:open={$dialogOpen}
  onOpenChange={(open: boolean) => {
    if (!open) {
      $dialogOpen = false;
      submitting = false;
      name = '';
      email = '';
      content = '';
    }
  }}
>
  <DialogPrimitive.Content class="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg md:w-full">
    <DialogPrimitive.Header>
      <DialogPrimitive.Title class="text-lg font-semibold">기능 추가 및 기타 제안</DialogPrimitive.Title>
      <DialogPrimitive.Description class="text-sm text-muted-foreground">
        추가했으면 하는 사운드나 기능을 제안해주세요.<br />
        혹은 기능상의 문제를 발견하셨다면, 문제점을 알려주세요.<br />
        가능한 빠르게 반영하도록 노력하겠습니다.
      </DialogPrimitive.Description>
    </DialogPrimitive.Header>

    <div class="grid gap-4 py-4">
      <div class="grid grid-cols-4 items-center gap-4">
        <Label class="text-right" for="name">이름</Label>
        <Input
          bind:value={name}
          id="name"
          class="col-span-3"
          placeholder="안녕하세요"
        />
      </div>
      <div class="grid grid-cols-4 items-center gap-4">
        <Label class="text-right" for="email">이메일</Label>
        <Input
          bind:value={email}
          id="email"
          type="email"
          class="col-span-3"
          placeholder="example@email.com"
        />
      </div>
      <div class="grid grid-cols-4 items-center gap-4">
        <Label class="text-right" for="content">내용</Label>
        <Textarea
          bind:value={content}
          id="content"
          class="col-span-3"
          placeholder="추가했으면 하는 ASMR 사운드나 기능을 설명해주세요. 기능상의 문제를 발견하셨다면, 문제점을 알려주세요."
        />
      </div>
    </div>

    <DialogPrimitive.Footer class="flex justify-end space-x-2">
      <DialogPrimitive.Close asChild>
        <Button
          variant="outline"
          on:click={() => $dialogOpen = false}
        >취소</Button>
      </DialogPrimitive.Close>
      <Button
        disabled={submitting}
        on:click={handleFeedbackSubmit}
      >
        {submitting ? '전송중...' : '전송하기'}
      </Button>
    </DialogPrimitive.Footer>
  </DialogPrimitive.Content>
</DialogPrimitive.Root>