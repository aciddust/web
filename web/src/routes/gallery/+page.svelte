<script lang="ts">
  import { onMount } from 'svelte';
  import * as THREE from 'three';
  import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
  import { toast } from 'svelte-sonner';
	import Button from '$lib/components/ui/button/button.svelte';
  import { Input } from "$lib/components/ui/input";

  // 추가할 이미지 URL이 있으면 추가하세요
  const imageUrls: string[] = [];
  let imageUrlBuffer = 'https://avatars.githubusercontent.com/u/108721439?v=4';

  let container: HTMLDivElement;
  let controls: PointerLockControls;

  // 화면 생성
  const scene = new THREE.Scene();
  // 카메라 변수 생성
  let camera: THREE.PerspectiveCamera;

  // 충돌감지를 위한 레이케스터 초기화
  const raycaster = new THREE.Raycaster();
  const raycasterDirection = new THREE.Vector3();
  const raycasterOrigin = new THREE.Vector3();

  // 오디오 로더, 리스너 생성
  let audioLoader: THREE.AudioLoader;
  let listener: THREE.AudioListener;
  let textureLoader: THREE.TextureLoader;

  // 사운드 변수 생성
  let footstepWalkingSound: THREE.Audio;
  let footstepRunningSound: THREE.Audio;

  // 키보드 입력 상태 저장
  let keyState: { [key: string]: boolean } = {};

  // key down 상태 저장
  const onKeyDown = (event: KeyboardEvent) => {
    keyState[event.key] = true;
  };

  // key up 상태 저장
  const onKeyUp = (event: KeyboardEvent) => {
    keyState[event.key] = false;
  };

  // 플레이어 이동 및 상태 업데이트
  const updateMovement = () => {
    let walkingSpeed = 0.1; // 평소 이동 속도
    let runningSpeed = 0.5; // 달릴 때 이동속도
    // Shift 키를 누르고 있으면 달리기
    let speed = keyState['Shift'] ? runningSpeed : walkingSpeed;

    // 컨트롤 초기화 안된경우 작동하지 않도록 막음
    if (!controls) {
      requestAnimationFrame(updateMovement);
      return;
    }

    // 플레이어의 현재 방향과 위치를 가져옴
    controls.getDirection(raycasterDirection);
    raycasterOrigin.copy(controls.object.position);

    // 레이캐스터를 플레이어의 현재 위치와 방향으로 설정
    raycaster.set(raycasterOrigin, raycasterDirection);

    // 벽과의 교차점 계산
    const intersections = raycaster.intersectObjects(scene.children);

    // 교차점이 있고, 일정 거리(예: 1) 이내에 있다면 이동하지 않음
    if (intersections.length > 0 && intersections[0].distance < 1) {
      speed=0
    }

    // 키보드 입력에 따라 플레이어 이동
    if (keyState['w'] || keyState['ArrowUp']) controls.moveForward(speed);
    if (keyState['a'] || keyState['ArrowLeft']) controls.moveRight(-speed);
    if (keyState['s'] || keyState['ArrowDown']) controls.moveForward(-speed);
    if (keyState['d'] || keyState['ArrowRight']) controls.moveRight(speed);

    // 플레이어 이동 속도에 따라 소리 재생
    if (keyState['w'] || keyState['a'] || keyState['s'] || keyState['d'] || keyState['ArrowUp'] || keyState['ArrowLeft'] || keyState['ArrowDown'] || keyState['ArrowRight']) {
      if (keyState['Shift']) {
        if (!footstepRunningSound.isPlaying) {
          footstepRunningSound.play();
        }
      } else {
        if (!footstepWalkingSound.isPlaying) {
          footstepWalkingSound.play();
        }
      }
    } else {
      footstepWalkingSound.stop();
      footstepRunningSound.stop();
    }
    requestAnimationFrame(updateMovement);
  }

  const audioLoaderByPath = (path: string, audio: THREE.Audio, volume: number, loop: boolean) => {
    audioLoader.load(path, (buffer) => {
      audio.setBuffer(buffer);
      audio.setLoop(loop);
      audio.setVolume(volume);
    })
  }

  const loadFloor = (path: string, rx: number, ry: number, sx: number, sy: number) => {
    /*
    rx: repeat x
    ry: repeat y
    sx: size x
    sy: size y
    */
    // 나무장판 텍스처 로드
    const floorTexture = textureLoader.load(path); // 나무장판 텍스처 경로로 변경하세요
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(rx, ry); // 텍스처 반복 횟수 조정
    // 바닥 메시 생성
    const floorGeometry = new THREE.PlaneGeometry(sx, sy); // 바닥 크기 조정
    const floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture });
    const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
    floorMesh.rotation.x = -Math.PI / 2; // 바닥을 수평으로 회전
    floorMesh.position.y = -0.5; // 바닥 위치 조정
    scene.add(floorMesh);
  }
  const loadWall = (path: string, sx: number, sy: number, dx: number, dy: number, dz: number) => {
    /*
    sx: size x
    sy: size y
    dx: delta x
    dy: delta y
    dz: delta z
    */
    const marbleWallTexture = textureLoader.load(path); // 대리석 벽 텍스처 경로로 변경하세요
    // 대리석 벽 메시 생성
    const wallGeometry = new THREE.PlaneGeometry(sx, sy); // 벽 크기 조정
    const wallMaterial = new THREE.MeshBasicMaterial({ map: marbleWallTexture });
    // 바닥이 끝나는 지점에 벽 생성
    const wallMeshFront = new THREE.Mesh(wallGeometry, wallMaterial);
    const wallMeshBack = new THREE.Mesh(wallGeometry, wallMaterial);
    const wallMeshLeft = new THREE.Mesh(wallGeometry, wallMaterial);
    const wallMeshRight = new THREE.Mesh(wallGeometry, wallMaterial);
    wallMeshFront.position.z = -dz;
    wallMeshFront.position.y = dy;
    wallMeshBack.position.z = dz;
    wallMeshBack.position.y = dy;
    // NOTE: 뒤에서 보면 안보임
    wallMeshBack.rotateX(Math.PI);
    wallMeshLeft.position.x = -dx;
    wallMeshLeft.position.y = dy;
    wallMeshLeft.rotateY(Math.PI / 2);
    wallMeshRight.position.x = dx;
    wallMeshRight.position.y = dy;
    wallMeshRight.rotateY(-Math.PI / 2);
    // 추가
    scene.add(wallMeshFront);
    scene.add(wallMeshBack);
    scene.add(wallMeshLeft);
    scene.add(wallMeshRight);
  }
  const attachImageOnWall = () => {
    // 이미지를 벽에 붙이는 로직
    // imageUrls를 하나씩 벽에 붙이기
    let wallLength = 50; // 벽 길이
    let spacing = 7; // 이미지 간격
    let imageWidth = 10;
    let currentWallIndex = 0;

    const walls = ['front', 'back', 'left', 'right']
    const wallUsedLength: { [key: string]: number } = {
      front: 0,
      back: 0,
      left: 0,
      right: 0
    }

    imageUrls.forEach((url, index) => {
      const imageTexture = textureLoader.load(url);
      const imageGeometry = new THREE.PlaneGeometry(imageWidth, imageWidth); // 정사각형 이미지 가정
      const imageMaterial = new THREE.MeshBasicMaterial({ map: imageTexture });
      const imageMesh = new THREE.Mesh(imageGeometry, imageMaterial);

      let currentWall = walls[currentWallIndex % walls.length];
      if (wallUsedLength[currentWall] + imageWidth > wallLength) {
        currentWallIndex++;
        currentWall = walls[currentWallIndex % walls.length];
        // wallUsedLength[currentWall] = 0;
      }
      let positionX = 0, positionZ = 0, rotationY = 0;
      let positionY = 10;

      // 벽에 따른 위치 및 회전 설정
      switch (currentWall) {
        case 'front':
          positionZ = (-wallLength / 2) + 1;
          positionX = wallUsedLength[currentWall] - (wallLength / 2 - imageWidth / 2);
          break;
        case 'back':
          positionZ = (wallLength / 2) - 1;
          positionX = wallUsedLength[currentWall] - (wallLength / 2 - imageWidth / 2);
          rotationY = Math.PI;
          break;
        case 'left':
          positionX = (-wallLength / 2) + 1;
          positionZ = wallUsedLength[currentWall] - (wallLength / 2 - imageWidth / 2);
          rotationY = Math.PI / 2;
          break;
        case 'right':
          positionZ = wallUsedLength[currentWall] - (wallLength / 2 - imageWidth / 2);
          positionX = (wallLength / 2) -1;
          rotationY = -Math.PI / 2;
          break;
      }

      // 이미지 위치 설정
      imageMesh.position.set(positionX, positionY, positionZ);
      // 높이 설정
      imageMesh.rotation.y = rotationY;

      // 벽 사용 길이 업데이트 및 벽 넘어가는 처리
      wallUsedLength[currentWall] += imageWidth + spacing;
      scene.add(imageMesh);
    });
  }

  onMount(
    () => {
    // 키보드 입력 이벤트 리스너 등록
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    // 이동 관련 업데이트 함수 호출
    updateMovement();

    // 렌더러, 카메라 생성 및 컨테이너에 추가
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();

    // 렌더러 크기 설정 및 컨테이너에 추가
    container.appendChild(renderer.domElement);

    const updateSize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, true); // true: devicePixelRatio
    }


    // 월드 생성 로직
    // 사운드 리스너 추가
    listener = new THREE.AudioListener();
    audioLoader = new THREE.AudioLoader();
    footstepRunningSound = new THREE.Audio(listener);
    footstepWalkingSound = new THREE.Audio(listener);
    audioLoaderByPath('/gallery/sounds/footstep-walk.wav', footstepWalkingSound, 1.0, true);
    audioLoaderByPath('/gallery/sounds/footstep-run.wav', footstepRunningSound, 1.0, true);
    // 카메라에 리스너 추가
    camera.add(listener);

    textureLoader = new THREE.TextureLoader();
    // 텍스처 로드
    loadFloor('/gallery/assets/wood-floor.jpg', 10, 10, 50, 50)
    loadWall('/gallery/assets/marble-pattern.jpg', 50, 20, 25, 9.5, 25)

    // 카메라 위치 설정
    camera.position.z = 10;
    camera.position.y = 3;

    // 이미지를 벽에 붙이는 로직
    attachImageOnWall();

    // 하늘 배경색 흰색으로 설정
    scene.background = new THREE.Color(0xffffff);

    // 플레이어 컨트롤 초기화
    controls = new PointerLockControls(camera, renderer.domElement);
    scene.add(controls.object);

    // 마우스 클릭 시 컨트롤 활성화
    container.addEventListener('click', () => {
      controls.lock();
    });

    // 초기 사이즈 업데이트
    updateSize();

    // 윈도우 사이즈 변경 시 카메라 비율 업데이트
    window.addEventListener('resize', updateSize);

    // 카메라를 씬에 추가
    scene.add(camera);

    // 렌더링 루프
    const animate = () => {
      requestAnimationFrame(animate);
      // 게임 로직 업데이트
      renderer.render(scene, camera);
    };

    animate();

    toast.success('Click area and move with W, A, S, D keys. Shift key to run.');

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', updateSize);
    };
  });
</script>

<div class="flex flex-col justify-center items-center align-middle" style="height: 80vh">
  <div bind:this={container} class="h-full w-full" ></div>
</div>

<div class="flex justify-center items-center align-middle">
  <Input
    placeholder="Image URL"
    bind:value={imageUrlBuffer}
    on:keydown={(e) => {
      if (e.key === 'Enter' && imageUrlBuffer) {
        imageUrls.push(imageUrlBuffer);
        imageUrlBuffer = '';
        attachImageOnWall();
      }
    }}
  />
  <Button on:click={() => {
    imageUrls.push(imageUrlBuffer);
    imageUrlBuffer = '';
    attachImageOnWall();
  }}>+</Button>
</div>
