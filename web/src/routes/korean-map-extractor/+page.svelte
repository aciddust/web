<script lang="ts">

  import { page } from '$app/state';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
  import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

  // // 페이지 파라미터 직접 접근
  // const { lat, lng } = page.params as unknown as PageParams;

  // $: name = (page.url.searchParams.get('name') || '') as string;
  // $: width = (page.url.searchParams.get('width') || 700) as string;
  // $: height = (page.url.searchParams.get('height') || 350) as string;
  // $: zoom = (page.url.searchParams.get('zoom') || 4) as number;

  let width = 700;
  let height = 350;
  let kakao: any;
  let mapContainer: HTMLElement;
  let lat = 37.4956
  let lng = 127.02905
  let zoom = 3
  let name = '신분당선 강남역 4번출구';
  let lastMapObject: any;
  let mapReady = false;

  const getMapStyle = (width: number, height: number): string => {
    return `width:${width}px; height:${height}px; display: flex; align-items: center; justify-content: center;`;
  }
  let mapStyle = getMapStyle(width, height);


  const validateCoordinates = (lat: number, lng: number): boolean => {
    if (isNaN(lat) || isNaN(lng)) {
      toast.error('유효하지 않은 좌표값입니다.');
      return false;
    }
    if (lat < -90 || lat > 90) {
      toast.error('위도는 -90° ~ 90° 범위 내여야 합니다.');
      return false;
    }
    if (lng < -180 || lng > 180) {
      toast.error('경도는 -180° ~ 180° 범위 내여야 합니다.');
      return false;
    }
    return true;
  };

  const validateMapSize = (width: number, height: number): boolean => {
    if (isNaN(width) || isNaN(height)) {
      toast.error('유효하지 않은 크기값입니다.');
      return false;
    }
    if (width < 100 || width > 1000) {
      toast.error('가로 크기는 100 ~ 1000 사이여야 합니다.');
      return false;
    }
    if (height < 100 || height > 1000) {
      toast.error('세로 크기는 100 ~ 1000 사이여야 합니다.');
      return false;
    }
    return true;
  };

  const drawMap = (
    lat: number,
    lng: number,
    name: string | null = null,
    zoom: number = 4,
  ) => {
    if (!kakao) {
      console.log('no kakao')
      return;
    }
    // 이전 지도 객체가 있다면 컨테이너를 초기화
    if (lastMapObject) {
      mapContainer.innerHTML = '';
      mapReady = false;
    }

    const staticMapOption = {
        marker : {
          text: '',
          position: new kakao.maps.LatLng(lat, lng) // 좌표가 없으면 지도 중심에 마커가 표시된다
        },
        center: new kakao.maps.LatLng(lat, lng), // 이미지 지도의 중심 좌표
        level: zoom, // 이미지 지도의 확대 레벨
        mapTypeId : kakao.maps.MapTypeId.ROADMAP // 지도종류
      };

    if (name) {
      // update staticMapOption.marker.text
      staticMapOption.marker.text = name;
    }
    lastMapObject = new kakao.maps.StaticMap(mapContainer, staticMapOption);
    mapReady = true;
  }

  const handleDraw = () => {
    if (!zoom) {
      toast.warning("스케일을 3으로 설정합니다.");
      zoom = 3;
    }
    if (!validateMapSize(width, height)) {
      toast.error("지도 크기정보가 유효하지 않습니다.");
      width = width || 700;
      height = height || 350;
      return;
    }
    mapStyle = getMapStyle(width, height);
    drawMap(lat, lng, name, zoom);
    toast.success("Okay");
  }

  onMount(() => {
    if (!window.kakao) {
      return;
    }
    const staticMapContainer  = document.getElementById('map') // 이미지 지도를 표시할 div
    if (!staticMapContainer) {
      return;
    }
    kakao = window.kakao;
    mapContainer = staticMapContainer;
    toast.success("Ready");
  });

  // $: mapStyle = getMapStyle(width, height);
</script>

<div class="flex flex-col items-center justify-center container pb-safe p-4">
  <div style="overflow-x: scroll; position: relative; width: 100%; height: 350px;">
    <div id="map" style={mapStyle}></div>
  </div>

  <div class="flex flex-col items-center justify-center w-full container">
    <div class="w-full max-w-full">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
        <div>
          <Label>Name</Label>
          <Input
            bind:value={name}
            class="w-full"
          />
        </div>
        <div>
          <Label>Latitude</Label>
          <Input
            type="number"
            bind:value={lat}
            class="w-full"
            on:keyup={() => {
              try {
                if (lat === undefined || lat === null) return;
                if (!validateCoordinates(lat, lng)) {
                  lat = 37.496486063;
                }
              } catch (e) {
                toast.error('위도 값이 유효하지 않습니다.');
                lat = 37.496486063;
              }
            }}
          />
        </div>
        <div>
          <Label>Longitude</Label>
          <Input
            type="number"
            bind:value={lng}
            class="w-full"
            on:keyup={() => {
              try {
                if (lng === undefined || lng === null) return;
                if (!validateCoordinates(lat, lng)) {
                  lng = 127.028361548;
                }
              } catch (e) {
                toast.error('경도 값이 유효하지 않습니다.');
                lng = 127.028361548;
              }
            }}
          />
        </div>
        <div>
          <Label>Scale</Label>
          <Input
            type="number"
            bind:value={zoom}
            class="w-full"
            min="1"
            max="14"
            step="1"
            on:keyup={() => {
              try {
                if (!zoom) {
                  return;
                }
                zoom = Math.min(14, Math.max(1, zoom));
              } catch (e) {
                toast.warning("Invalid scale (1 ~ 14)");
                zoom = 3;
              }
            }}
          />
        </div>
      </div>
      {#if mapReady}
        <!-- open another tab img src-->
        <Button
          class="mt-4 w-full"
          variant="outline"
          on:click={() => {
            if (!mapContainer) {
              toast.error('지도가 준비되지 않았습니다.');
              return;
            }
            const img = mapContainer.querySelector('img');
            if (!img) {
              toast.error('이미지를 찾을 수 없습니다.');
              return;
            }
            const src = img.src;
            if (!src) {
              toast.error('이미지 주소를 찾을 수 없습니다.');
              return;
            }
            // 새 탭에서 이미지 열기
            window.open(src, '_blank');
          }}
        >
          Download
        </Button>
      {/if}
      <Button class="mt-4 w-full" on:click={handleDraw}>
        Draw
      </Button>
    </div>
  </div>
</div>

<style>
  @supports (-webkit-touch-callout: none) {
    .pb-safe {
      padding-bottom: env(safe-area-inset-bottom);
    }
  }
</style>