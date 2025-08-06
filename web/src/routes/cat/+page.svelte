<script lang="ts">
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';
  import * as THREE from 'three';
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

  let audio: HTMLAudioElement;
  let isBGMAudioPlaying = false;
  let container: HTMLDivElement;
  let loadingProgress = 0; // 로딩 진행률 (0-100)
  let isLoading = true; // 로딩 상태

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

    // 모바일 최적화: 화면 크기에 따른 카메라 설정
    const width = container.clientWidth;
    const height = container.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

    // 모바일 최적화: 안티앨리어싱과 픽셀 비율 설정
    const renderer = new THREE.WebGLRenderer({
      antialias: window.devicePixelRatio <= 1, // 고해상도 디바이스에서는 안티앨리어싱 비활성화
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 최대 2배까지만 픽셀 비율 적용

    const textureLoader = new THREE.TextureLoader();

    // 마우스/터치 컨트롤 변수 추가
    let mouseX = 0;
    const maxRotation = Math.PI / 4; // 최대 회전 각도: Math.PI / 4 (45도)
    let isAudioStarted = false; // 오디오 시작 여부 추적
    let animationId: number; // 애니메이션 프레임 ID
    let lastMouseMove = 0; // 마지막 마우스 이동 시간

    // 키보드 회전 변수 추가
    let keyboardRotationY = 0;
    const keyboardRotationSpeed = 0.3; // 키보드 회전 속도
    let keysPressed: { [key: string]: boolean } = {};

    // 점프 애니메이션 변수 추가
    let jumpOffset = 0;
    let jumpSpeed = 0;
    const jumpHeight = 0.3; // 점프 높이
    const gravity = -0.01; // 중력
    const jumpInitialSpeed = 0.08; // 점프 초기 속도

    // 터치 관련 변수 추가
    let isTouching = false;
    let touchRotationY = 0;
    const touchRotationSpeed = 0.3;

    // 마우스 클릭 관련 변수 추가
    let isClicking = false;
    let clickRotationY = 0;
    const clickRotationSpeed = 0.3;

    // 컨테이너 크기에 맞게 랜더러 설정
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    // 마우스/터치 이벤트 핸들러 추가 (throttling 적용)
    function onMouseMove(event: MouseEvent) {
      const now = Date.now();
      if (now - lastMouseMove < 16) return; // 60fps로 제한 (16ms)
      lastMouseMove = now;

      // 마우스 X 위치를 -1 ~ 1 범위로 정규화
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    }

    // 터치 시작 이벤트 (오디오 재생 + 회전/점프 시작)
    function onTouchStart(event: TouchEvent) {
      isTouching = true;

      // 터치 시작 시 점프 트리거
      if (jumpOffset === 0 && jumpSpeed === 0) {
        jumpSpeed = jumpInitialSpeed;
      }

      // 오디오 재생
      if (!isAudioStarted && audio) {
        audio.play().catch(error => {
          console.log('Audio autoplay prevented:', error);
        });
        isAudioStarted = true;
      }
    }

    // 터치 종료 이벤트
    function onTouchEnd(event: TouchEvent) {
      isTouching = false;
      touchRotationY = 0; // 터치 회전 초기화

      // 터치가 끝나면 오디오 멈춤
      if (audio && isAudioStarted) {
        audio.pause();
        audio.currentTime = 0;
        isAudioStarted = false;
      }
    }

    // 터치 이벤트 핸들러 추가 (모바일 지원)
    function onTouchMove(event: TouchEvent) {
      event.preventDefault();
      const now = Date.now();
      if (now - lastMouseMove < 16) return; // 60fps로 제한 (16ms)
      lastMouseMove = now;

      if (event.touches.length > 0) {
        const touch = event.touches[0];
        // 터치 X 위치를 -1 ~ 1 범위로 정규화
        mouseX = (touch.clientX / window.innerWidth) * 2 - 1;

        // 터치 중일 때 회전 애니메이션
        if (isTouching) {
          touchRotationY += touchRotationSpeed;
        }
      }
    }

    // 마우스 클릭 이벤트 핸들러 추가
    function onMouseDown(event: MouseEvent) {
      isClicking = true;

      // 클릭 시작 시 점프 트리거
      if (jumpOffset === 0 && jumpSpeed === 0) {
        jumpSpeed = jumpInitialSpeed;
      }

      // 오디오 재생
      if (!isAudioStarted && audio) {
        audio.play().catch(error => {
          console.log('Audio autoplay prevented:', error);
        });
        isAudioStarted = true;
      }
    }

    function onMouseUp(event: MouseEvent) {
      isClicking = false;
      clickRotationY = 0; // 클릭 회전 초기화

      // 클릭이 끝나면 오디오 멈춤
      if (audio && isAudioStarted) {
        audio.pause();
        audio.currentTime = 0;
        isAudioStarted = false;
      }
    }

    // 키보드 이벤트 핸들러 추가
    function onKeyDown(event: KeyboardEvent) {
      keysPressed[event.code] = true;

      // 화살표 키가 눌렸을 때만 오디오 재생
      if ((event.code === 'ArrowLeft' || event.code === 'ArrowRight') && !isAudioStarted && audio) {
        audio.play().catch(error => {
          console.log('Audio autoplay prevented:', error);
        });
        isAudioStarted = true;
      }
    }

    function onKeyUp(event: KeyboardEvent) {
      keysPressed[event.code] = false;

      // 화살표 키를 뗐을 때 오디오 멈춤
      if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
        if (audio && isAudioStarted) {
          audio.pause();
          audio.currentTime = 0; // 처음부터 다시 재생하도록 위치 초기화
          isAudioStarted = false;
        }
      }
    }

    // 키보드 입력 처리 수정
    function handleKeyboardInput() {
      // Shift 키가 눌려있으면 속도를 절반으로 줄임
      const currentSpeed = keysPressed['ShiftLeft'] || keysPressed['ShiftRight'] 
        ? keyboardRotationSpeed * 0.5
        : keyboardRotationSpeed;

      if (keysPressed['ArrowLeft']) {
        keyboardRotationY += currentSpeed;
        // 회전 시작 시 점프 트리거
        if (jumpOffset === 0 && jumpSpeed === 0) {
          jumpSpeed = jumpInitialSpeed;
        }
      } else if (keysPressed['ArrowRight']) {
        keyboardRotationY -= currentSpeed;
        // 회전 시작 시 점프 트리거
        if (jumpOffset === 0 && jumpSpeed === 0) {
          jumpSpeed = jumpInitialSpeed;
        }
      } else if (!isTouching) {
        // 터치 중이 아닐 때만 키보드 회전 초기화
        keyboardRotationY = 0;
      }

      // 터치 중일 때 지속적인 점프
      if (isTouching && jumpOffset === 0 && jumpSpeed === 0) {
        jumpSpeed = jumpInitialSpeed;
      }

      // 클릭 중일 때 지속적인 회전과 점프
      if (isClicking) {
        clickRotationY += clickRotationSpeed;
        if (jumpOffset === 0 && jumpSpeed === 0) {
          jumpSpeed = jumpInitialSpeed;
        }
      }

      // 점프 물리 계산
      if (jumpOffset > 0 || jumpSpeed > 0) {
        jumpOffset += jumpSpeed;
        jumpSpeed += gravity;

        // 바닥에 착지하면 점프 종료
        if (jumpOffset <= 0) {
          jumpOffset = 0;
          jumpSpeed = 0;
        }
      }
    }

    // 이벤트 리스너 등록
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // 마우스 클릭 이벤트 추가
    container.addEventListener('mousedown', onMouseDown, { passive: true });
    container.addEventListener('mouseup', onMouseUp, { passive: true });

    // 모바일 터치 이벤트 추가
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchend', onTouchEnd, { passive: true });

    // 텍스처 추가 (진행률 업데이트)
    textureLoader.load(
      '/cat/background.png',
      texture => {
        scene.background = texture;
        // 모바일 최적화: 텍스처 품질 조정
        texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy()); // 최대 4배로 제한
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        loadingProgress = 10; // 텍스처 로딩 완료시 10%
      },
      (progress) => {
        // 텍스처 로딩 중 (0-10%)
        if (progress.lengthComputable) {
          loadingProgress = (progress.loaded / progress.total) * 10;
        }
      },
      error => {
        toast.error('Failed to load texture');
      }
    );

    // 배경색 흰색
    scene.background = new THREE.Color(0xffffff);

    // 조명 추가
    const light = new THREE.AmbientLight(0xffffff, 3);
    scene.add(light);

    // GLTF 모델 로드 (진행률 업데이트)
    const gltfLoader = new GLTFLoader();

    // GLTF 로딩 진행률 추적
    gltfLoader.load(
      '/cat/model.glb', // GLB 파일 경로로 변경
      (gltf) => {
        loadingProgress = 100; // GLTF 로딩 완료시 100%

        const object = gltf.scene;

        // 모델에 이름 추가 (리사이즈 시 참조용)
        object.name = 'loadedModel';

            // 모바일 최적화: 화면 크기와 방향에 따른 모델 위치 및 크기 조정
            const isMobile = window.innerWidth <= 768;
            const isPortrait = window.innerHeight > window.innerWidth;
            const aspectRatio = window.innerWidth / window.innerHeight;

            // 모델 크기 조정
            if (isMobile) {
              if (isPortrait) {
                // 세로 화면: 모델을 작게 하고 아래로 이동
                object.scale.set(0.7, 0.7, 0.7);
                object.position.y = -0.4;
              } else {
                // 가로 화면: 모델을 더 작게 하고 위치 조정
                object.scale.set(0.6, 0.6, 0.6);
                object.position.y = -0.2;
              }
            } else {
              // 데스크톱: 기본 크기
              object.scale.set(1, 1, 1);
              object.position.y = -0.2;
            }

            scene.add(object);

            // 애니메이션 시작
            let currentCameraRotationY = 0;
            let targetCameraRotationY = 0;
            let currentModelRotationY = 0;
            let targetModelRotationY = 0;
            let needsUpdate = true;

            function animate() {
              // 키보드 입력 처리 (모델 회전)
              handleKeyboardInput();

              // 마우스/터치 회전 (카메라)
              targetCameraRotationY = mouseX * maxRotation;

              // 키보드 회전 + 터치 회전 (모델)
              targetModelRotationY = keyboardRotationY + touchRotationY + clickRotationY;

              // 카메라 회전 업데이트
              const cameraRotationDiff = Math.abs(targetCameraRotationY - currentCameraRotationY);
              if (cameraRotationDiff > 0.001) {
                currentCameraRotationY += (targetCameraRotationY - currentCameraRotationY) * 0.05;
                camera.rotation.y = currentCameraRotationY;
                needsUpdate = true;
              }

              // 모델 회전 및 점프 업데이트
              const modelRotationDiff = Math.abs(targetModelRotationY - currentModelRotationY);
              if (modelRotationDiff > 0.001) {
                currentModelRotationY += (targetModelRotationY - currentModelRotationY) * 0.05;
                object.rotation.y = currentModelRotationY;
                needsUpdate = true;
              }

              // 점프 애니메이션 적용
              const isMobile = window.innerWidth <= 768;
              const isPortrait = window.innerHeight > window.innerWidth;
              let baseY;

              if (isMobile) {
                baseY = isPortrait ? -0.4 : -0.2;
              } else {
                baseY = -0.2;
              }

              object.position.y = baseY + jumpOffset;

              // 점프 중이거나 터치 중이거나 클릭 중이면 렌더링 필요
              if (jumpOffset > 0 || jumpSpeed !== 0 || isTouching || isClicking) {
                needsUpdate = true;
              }

              // 변화가 없으면 렌더링 안함
              if (cameraRotationDiff <= 0.001 && modelRotationDiff <= 0.001 && jumpOffset === 0 && jumpSpeed === 0 && !isTouching && !isClicking) {
                needsUpdate = false;
              }

              // 변화가 있을 때만 렌더링
              if (needsUpdate) {
                renderer.render(scene, camera);
              }

              animationId = requestAnimationFrame(animate);
            }
            animate();

            // 로딩 완료 후 약간의 지연을 두고 로딩 화면 숨김
            setTimeout(() => {
              isLoading = false;
              toast.success('화면을 클릭해보세요');
            }, 500);
          },
          (progress) => {
            // GLTF 로딩 중 (10-100%)
            if (progress.lengthComputable) {
              loadingProgress = 10 + (progress.loaded / progress.total) * 90;
            }
          },
          (error) => {
            console.error('Model loading error:', error);
            toast.error('Failed to load model');
            isLoading = false;
          }
        );

    // 프리셋 1
    // 모델 왼쪽으로 30도 회전
    scene.rotation.y = -Math.PI / 3.2;
    // 모바일 최적화: 화면 크기와 방향에 따른 카메라 위치 조정
    const isMobile = window.innerWidth <= 768;
    const isPortrait = window.innerHeight > window.innerWidth;

    if (isMobile) {
      if (isPortrait) {
        // 세로 화면: 카메라를 더 멀리 배치
        scene.position.z = -0.5;
        camera.position.z = 1.0;
      } else {
        // 가로 화면: 카메라를 적당히 배치
        scene.position.z = -0.3;
        camera.position.z = 0.7;
      }
    } else {
      // 데스크톱: 기본 위치
      scene.position.z = -0.5;
      camera.position.z = 0.5;
    }

    // 모델을 좀더 밝게
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.5,
          metalness: 0.5,
        });
      }
    });

    // 리사이즈 핸들러 (모바일 최적화)
    function handleResize() {
      const width = container.clientWidth;
      const height = container.clientHeight;
      const isMobile = window.innerWidth <= 768;
      const isPortrait = window.innerHeight > window.innerWidth;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // 화면 방향에 따른 카메라 위치 재조정
      if (isMobile) {
        if (isPortrait) {
          // 세로 화면: 카메라를 더 멀리
          scene.position.z = -0.5;
          camera.position.z = 1.0;
        } else {
          // 가로 화면: 카메라를 적당히
          scene.position.z = -0.3;
          camera.position.z = 0.7;
        }
      } else {
        // 데스크톱: 기본 위치
        scene.position.z = -0.5;
        camera.position.z = 0.5;
      }

      // 모델이 이미 로드되어 있다면 크기와 위치 재조정
      const object = scene.getObjectByName('loadedModel');
      if (object) {
        if (isMobile) {
          if (isPortrait) {
            object.scale.set(0.7, 0.7, 0.7);
            object.position.y = -0.4;
          } else {
            object.scale.set(0.6, 0.6, 0.6);
            object.position.y = -0.2;
          }
        } else {
          object.scale.set(1, 1, 1);
          object.position.y = -0.2;
        }
      }
    };
    window.addEventListener('resize', handleResize);

    // 화면 방향 변경 감지 (모바일)
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        handleResize();
      }, 100); // 방향 변경 후 약간의 지연
    });

    audio = new Audio('/cat/bgm.mp3');
    audio.loop = true;
    audio.volume = 0.5;

    isLoading = false;
    toast.success('로딩중이에요');

    // 언마운트 핸들러
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      container.removeEventListener('mousedown', onMouseDown);
      container.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchend', onTouchEnd);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  });
</script>

<!-- 모바일 최적화: viewport meta 태그와 CSS 추가 -->
<svelte:head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
</svelte:head>

<div
  style="width: 100%; height: 85vh; touch-action: manipulation; overflow: hidden; position: relative;"
  bind:this={container}
>
  {#if isLoading}
    <!-- 컨테이너 내부 로딩 화면 -->
    <div class="container-loading">
      <div class="container-loading-content">
        <div class="container-loading-image">
          <img src="/cat/background.png" alt="Loading..." />
        </div>
      </div>
    </div>

    <!-- 전체 화면 로딩 스크린 (기존) -->
    <div class="loading-screen">
      <div class="loading-content">
        <!-- 로딩 이미지 -->
        <div class="loading-image-container">
          <img src="/cat/background.png" alt="Loading..." class="loading-image" />
        </div>

        <!-- 프로그레스 바 -->
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" style="width: {loadingProgress}%"></div>
          </div>
          <div class="progress-text">
            {Math.round(loadingProgress)}%
          </div>
        </div>
        <!-- 로딩 텍스트 -->
        <div class="loading-text">
          준비중...
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  /* 모바일 최적화 CSS */
  :global(body) {
    margin: 0;
    padding: 0;
    overflow: hidden;
    -webkit-overflow-scrolling: touch;
  }

  /* 모바일에서 선택 방지 */
  div {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
  }

  /* 로딩 화면 스타일 */
  .loading-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    text-align: center;
  }

  .loading-image-container {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    animation: float 2s ease-in-out infinite;
  }

  .loading-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  .progress-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    width: 300px;
    max-width: 80vw;
  }

  .progress-bar {
    width: 100%;
    height: 8px;
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    overflow: hidden;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
    border-radius: 4px;
    transition: width 0.3s ease;
    position: relative;
  }

  .progress-fill::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  .progress-text {
    color: white;
    font-size: 1.2rem;
    font-weight: bold;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  }

  .loading-text {
    color: white;
    font-size: 1.1rem;
    font-weight: 500;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }

  /* 컨테이너 내부 로딩 스타일 */
  .container-loading {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
  }

  .container-loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .container-loading-image {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    animation: containerFloat 2s ease-in-out infinite;
  }

  .container-loading-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @keyframes containerFloat {
    0%, 100% {
      transform: translateY(0px) scale(1);
    }
    50% {
      transform: translateY(-8px) scale(1.05);
    }
  }

  .container-loading-text {
    color: #495057;
    font-size: 0.9rem;
    font-weight: 500;
    animation: containerPulse 2s ease-in-out infinite;
  }

  @keyframes containerPulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }

  /* 모바일에서 컨테이너 로딩 조정 */
  @media (max-width: 768px) {
    .container-loading-image {
      width: 60px;
      height: 60px;
    }

    .container-loading-text {
      font-size: 0.8rem;
    }
  }

  /* ...existing mobile styles... */
</style>