<script lang="ts">
  import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
  import * as dat from 'lil-gui'
  import * as THREE from 'three';
  import { GLTFLoader } from 'three/examples/jsm/Addons.js';

  import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
  import type { modelPathType } from '$lib/asmr/interfaces';
  import {
    audio,
    audioPlaying,
    audioVolume,
    modelPath,
    modelLoaded,
  } from '$lib/asmr/data';
	import Button from '$lib/components/ui/button/button.svelte';

  let scene: THREE.Scene;
  let container: HTMLDivElement;
  let loading = true;
  let listener: THREE.AudioListener;
  let mouse = new THREE.Vector2();
  let camera: THREE.PerspectiveCamera;
  let renderer: THREE.WebGLRenderer;
  let gltfLoader: GLTFLoader;
  let dragControls: DragControls;
  let draggableObjects: THREE.Object3D[] = [];
  let gui: dat.GUI
  let modelLoading = false;

  function onMouseMove(
    event: MouseEvent,
  ) {
    const rect = container.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;
  }

  function audioPlayingFalseAll() {
    for (const key in audioPlaying) {
      audioPlaying[key] = false;
    }
  }

  // 리사이즈 핸들러
  function handleResize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };

  function applyDebug(
    gui: dat.GUI,
    modelName: string,
    modelGroup: THREE.Group,
    sound: THREE.PositionalAudio,
    volume?: number,
  ) {
    const folder = gui.addFolder(modelName);
    // dev 실행환경일떄만
    if (import.meta.env.MODE === 'development') {
      folder.add(modelGroup.position, 'x').min(-10).max(10).step(0.1).name(`${modelName}_x`);
      folder.add(modelGroup.position, 'y').min(-10).max(10).step(0.1).name(`${modelName}_y`);
      folder.add(modelGroup.position, 'z').min(-10).max(10).step(0.1).name(`${modelName}_z`);
      folder.add(modelGroup.scale, 'x').min(0.1).max(10).step(0.1).name(`${modelName}_scale_x`);
      folder.add(modelGroup.scale, 'y').min(0.1).max(10).step(0.1).name(`${modelName}_scale_y`);
      folder.add(modelGroup.scale, 'z').min(0.1).max(10).step(0.1).name(`${modelName}_scale_z`);
      folder.add(modelGroup.rotation, 'x').min(-Math.PI).max(Math.PI).step(0.1).name(`${modelName}_rotation_x`);
      folder.add(modelGroup.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.1).name(`${modelName}_rotation_y`);
      folder.add(modelGroup.rotation, 'z').min(-Math.PI).max(Math.PI).step(0.1).name(`${modelName}_rotation_z`);
    }
    folder.add({ volume: volume || sound.getVolume() }, 'volume')
      .min(0)
      .max(1)
      .step(0.1)
      .name('volume')
      .onChange((value: number) => sound.setVolume(value));
  }

  function cleanDebug(gui: dat.GUI, modelName: string) {
    const folder = gui.folders.find((f: any) => f._title === modelName);
    if (folder) {
      // root 제거
      folder.destroy();
    }
  }

  async function loadModel(
    modelType: keyof modelPathType,
    volume: number,
    position?: THREE.Vector3,
    scale?: THREE.Vector3,
    rotate?: THREE.Euler,
    gui?: dat.GUI,
  ) {
    modelLoading = true;
    await gltfLoader.loadAsync(modelPath[modelType]).then((gltf) => {
      console.log(`Loading model: ${modelType}`);
      console.log('Position:', position);
      console.log('Scale:', scale);
      console.log('Rotation:', rotate);
      const modelGroup = new THREE.Group();
      if (position) {
        gltf.scene.position.copy(position)
        console.log('Applied position: ', gltf.scene.position);
      }
      if (scale) {
        gltf.scene.scale.copy(scale)
      }
      if (rotate) {
        gltf.scene.rotation.copy(rotate)
      }
      modelGroup.add(gltf.scene);
      // positional audio 추가
      const sound = new THREE.PositionalAudio(listener);
      const audioLoader = new THREE.AudioLoader();
      audioLoader.load(audio[modelType], (buffer) => {
        sound.setBuffer(buffer);
        sound.setRefDistance(5);
        sound.setRolloffFactor(1);
        sound.setLoop(true);
        sound.setVolume(volume);
        sound.play();
      });
      modelGroup.add(sound);
      modelGroup.name = String(modelType);
      scene.add(modelGroup);
      draggableObjects.push(modelGroup);
      if (gui) {
        applyDebug(gui, String(modelType), modelGroup, sound, volume);
      }
      modelLoaded[modelType] = true;
      audioPlaying[modelType] = true;
      toast.success("😊");
    }).catch((error) => {
      console.error('An error happened', error);
      toast.error('😢');
    });
    modelLoading = false;
  }

  async function toggleModel(
    modelType: keyof modelPathType,
    volume: number,
    position?: THREE.Vector3,
    scale?: THREE.Vector3,
    rotate?: THREE.Euler,
    debugGui?: dat.GUI,
  ) {
    const object = scene.getObjectByName(String(modelType));
    if (modelLoaded[modelType]) {
      if (object) {
        const index = draggableObjects.indexOf(object);
        if (index > -1) {
          draggableObjects.splice(index, 1);
        }
        object.traverse((child) => {
          if (child instanceof THREE.PositionalAudio) {
            child.stop();
            child.disconnect();
          }
        });
        if (debugGui) {
          cleanDebug(debugGui, String(modelType));
        }
        scene.remove(object);
      }
      modelLoaded[modelType] = false;
      audioPlaying[modelType] = false;
    } else {
      await loadModel(
        modelType,
        volume,
        position,
        scale,
        rotate,
        debugGui,
      );
    }
  }

  onMount(() => {
    // scene, camera, renderer, texture loader 생성
    scene = new THREE.Scene();
    listener = new THREE.AudioListener();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.add(listener);
    renderer = new THREE.WebGLRenderer({antialias: true});
    gltfLoader = new GLTFLoader();
    gui = new dat.GUI();
    dragControls = new DragControls(draggableObjects, camera, renderer.domElement);
    dragControls.transformGroup = true;

    const player = new THREE.Object3D();
    player.position.set(0, 0, 0);
    scene.add(player);

    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }

    // 마우스 클릭 리스너 추가
    container.addEventListener(
      'mousemove',
      (event) => onMouseMove(event)
    );

    // 컨테이너 크기에 맞게 랜더러 설정
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // 배경 색 설정
    renderer.setClearColor(0xD1B7A1, 1);

    // 카메라 위치
    camera.position.set(5, 5, 15); // x, y, z
    camera.lookAt(0, 0, 0);

    // 조명 추가
    const light = new THREE.AmbientLight(0xffffff, 4);
    scene.add(light);

    // 리사이즈 핸들러 추가
    window.addEventListener(
      'resize',
      () => handleResize()
    );

    // 렌더링 시작
    animate();

    loading = false;
    toast.success('Have fun');

    // 언마운트 핸들러
    return () => {
      window.removeEventListener(
        'resize',
        () => handleResize()
      );
      if (dragControls) {
        dragControls.dispose();
      }
      container.removeEventListener(
        'mousemove',
        (event) => onMouseMove(event)
      );
      // 모든 사운드 중단
      scene.traverse((child) => {
        if (child instanceof THREE.PositionalAudio) {
          child.stop();
          child.disconnect();
        }
      });
      // 오디오 재생상태 비활성화
      audioPlayingFalseAll();
      // 디버거 제거
      gui.destroy();
      container.removeChild(renderer.domElement);
    };
  });
</script>

<div style="width: 100%; height: 80vh;" bind:this={container}>
  {#if loading}
    <div class="flex justify-center items-center h-full">
      <div class="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  {/if}
</div>
<div class="flex justify-center items-center space-x-2 pt-4">
  <Button
    disabled={modelLoading}
    class="{audioPlaying['fireplace'] ? 'bg-green-500' : 'bg-gray-300'} {audioPlaying['fireplace'] ? 'hover:bg-yellow-600' : 'hover:bg-green-600'}"
    on:click={async () => await toggleModel(
      'fireplace',
      audioVolume['fireplace'],
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.5, 0.5, 0.5),
      undefined,
      gui,
    )
  }>🔥</Button>
  <Button
    disabled={modelLoading}
    class="{audioPlaying['bird'] ? 'bg-green-500' : 'bg-gray-300'} {audioPlaying['bird'] ? 'hover:bg-yellow-600' : 'hover:bg-green-600'}"
    on:click={async () => await toggleModel(
      'bird',
      audioVolume['bird'],
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(1, 1, 1),
      undefined,
      gui,
    )
  }>🦜</Button>
  <Button
    disabled={modelLoading}
    class="{audioPlaying['rain'] ? 'bg-green-500' : 'bg-gray-300'} {audioPlaying['bird'] ? 'hover:bg-yellow-600' : 'hover:bg-green-600'}"
    on:click={async () => await toggleModel(
      'rain',
      audioVolume['rain'],
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.3, 0.3, 0.3),
      undefined,
      gui,
    )
  }>☔</Button>
  <Button
    disabled={modelLoading}
    class="{audioPlaying['keyboard'] ? 'bg-green-500' : 'bg-gray-300'} {audioPlaying['keyboard'] ? 'hover:bg-yellow-600' : 'hover:bg-green-600'}"
    on:click={async () => await toggleModel(
      'keyboard',
      audioVolume['keyboard'],
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.02, 0.02, 0.02),
      new THREE.Euler(0.5, 0.05, 0.05),
      gui,
    )
  }>💻</Button>
  <Button
    disabled={modelLoading}
    class="{audioPlaying['footsteps'] ? 'bg-green-500' : 'bg-gray-300'} {audioPlaying['footsteps'] ? 'hover:bg-yellow-600' : 'hover:bg-green-600'}"
    on:click={async () => await toggleModel(
      'footsteps',
      audioVolume['footsteps'],
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.04, 0.04, 0.04),
      new THREE.Euler(0.5, 0.05, 0.05),
      gui,
    )
  }>👞</Button>
  <Button
    disabled={modelLoading}
    class="{audioPlaying['phone'] ? 'bg-green-500' : 'bg-gray-300'} {audioPlaying['phone'] ? 'hover:bg-yellow-600' : 'hover:bg-green-600'}"
    on:click={async () => await toggleModel(
      'phone',
      audioVolume['phone'],
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(3, 3, 3),
      new THREE.Euler(0.5, 0.05, 0.05),
      gui,
    )
  }>📱</Button>
</div>
