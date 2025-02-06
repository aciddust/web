<script lang="ts">
  import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
  import * as THREE from 'three';
  import { GLTFLoader, ThreeMFLoader } from 'three/examples/jsm/Addons.js';

  let audio: HTMLAudioElement;
  let isBGMAudioPlaying = false;
  let container: HTMLDivElement;
  let loading = true;

  function toggleBGM() {
    if (isBGMAudioPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    isBGMAudioPlaying = !isBGMAudioPlaying;
  }

  onMount(() => {
    // scene, camera, renderer, texture loader 생성
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({antialias: true});
    const textureLoader = new THREE.TextureLoader();

    // 모델 이동 속도 설정
    const moveSpeed = 0.1;
    const rotateSpeed = 0.1;
    const keyPressed = new Set();

    // 컨테이너 크기에 맞게 랜더러 설정
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // 텍스처 추가
    textureLoader.load(
      '/chill/background.png',
      texture => {
        scene.background = texture;
      },
      undefined,
      error => {
        toast.error('Failed to load texture');
      }
    )

    // 조명 추가
    const light = new THREE.AmbientLight(0xffffff, 1);
    scene.add(light);

    // 키보드 이벤트 핸들러
    window.addEventListener('keydown', event => {
      keyPressed.add(event.key);
    });
    window.addEventListener('keyup', event => {
      keyPressed.delete(event.key);
    });

    // GLB 모델 로드
    const loader = new GLTFLoader();
    loader.loadAsync('/chill/model.glb').then(gltf => {
      scene.add(gltf.scene);

      function animate() {
        // 키보드 이벤트 처리
        if (keyPressed.has('ArrowUp')) {
          scene.position.z += moveSpeed;
          if (scene.position.z > 0) {
            scene.position.z = 0;
          }
        }
        if (keyPressed.has('ArrowDown')) {
          scene.position.z -= moveSpeed;
          if (scene.position.z < -4) {
            scene.position.z = -4;
          }
        }
        if (keyPressed.has('ArrowLeft')) {
          scene.rotation.y += rotateSpeed;
        }
        if (keyPressed.has('ArrowRight')) {
          scene.rotation.y -= rotateSpeed;
        }
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
      }
      animate();
    }).catch(error => {
      toast.error('Failed to load model');
    });

    // 모델 왼쪽으로 145도 회전
    scene.rotation.y = -Math.PI / 2 - Math.PI / 4;
    // 모델이 카메라로 더 가까워지도록 이동
    scene.position.z = -0.6;
    camera.position.z = 0.5;

    // 리사이즈 핸들러
    function handleResize() {
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    audio = new Audio('/chill/bgm.mp3');
    audio.loop = true;
    audio.volume = 0.5;

    loading = false;
    toast.success('Chill Guy here!');

    // 언마운트 핸들러
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', event => {
        keyPressed.add(event.key);
      });
      window.removeEventListener('keyup', event => {
        keyPressed.delete(event.key);
      });
      container.removeChild(renderer.domElement);
    };
  });
</script>

<div style="width: 100%; height: 80vh;" bind:this={container}>
  {#if isBGMAudioPlaying}
    <p class="fixed bottom-4 left-16">https://pixabay.com/music/modern-classical-chill-guy-piano-269950</p>
  {:else}
    <p class="font-bold text-center">Click the 🔊 button to play the background music</p>
  {/if}
  <button
    class="fixed bottom-4 left-4 p-2 bg-gray-800 text-white rounded-full"
    on:click={toggleBGM}
  >
    {isBGMAudioPlaying ? '🔇' : '🔊'}
  </button>
  {#if loading}
    <div class="flex justify-center items-center h-full">
      <div class="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  {/if}
</div>
