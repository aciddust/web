<script lang="ts">
  import { get } from 'svelte/store';
  import * as THREE from 'three';
  
  import * as dat from 'lil-gui'

  export let gui: dat.GUI;
</script>


<Button
  disabled={modelLoading}
  on:click={async () => await toggleModel(
    'fireplace',
    get(audioVolume['fireplace']),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.5, 0.5, 0.5),
    undefined,
    gui,
  )
}>🔥</Button>