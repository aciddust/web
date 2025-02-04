<script lang='ts'>
  import Button from "$lib/components/ui/button/button.svelte";
  import { toast } from "svelte-sonner";
</script>

<Button on:click={() => toast("hello world")}>Click me</Button>