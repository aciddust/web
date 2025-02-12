<script lang="ts">
	import Cube from "$lib/components/misc/cube.svelte";
	import Button from "$lib/components/ui/button/button.svelte";

	let isSpinning = true;
</script>

<div class="bg-transparent w-full flex flex-col justify-center items-center text-center max-h-[80vh]">
<Cube isSpinning={isSpinning} />
<Button
	class="mt-4 outline-none"
	variant="outline"
	on:click={
	() => {
		isSpinning = !isSpinning;
	}
}>{isSpinning ? 'Stop' : 'Spin'} </Button>
</div>
