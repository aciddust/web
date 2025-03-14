<script lang='ts'>
  import { onMount } from "svelte";

  export let data;
  let id: string;

  const getOriginUrl = async () => {
    const response = await fetch(`/api/ziplink/${id}`);
    const data = await response.json();
    return data;
  }

  onMount(async () => {
    id = data.id;
    const response = await getOriginUrl();
    window.location.href = response.url;
  });
</script>
