<script lang="ts">

	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
  import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
  import type { KakaoAddressResponse } from '../api/korean-map-extractor/kakao/+server';

  let width = 700;
  let height = 350;
  let kakao: any;
  let mapContainer: HTMLElement;
  let address = "강남대로 311";
  let lat = 37.4956
  let lng = 127.02905
  let zoom = 3
  let name = '신분당선 강남역 4번출구';
  let lastMapObject: any;
  let mapReady = false;
  let isSearching = false;
  let isDrawing = false;

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

  const getLocation = async (address: string): Promise<void> => {
    const response = await fetch(`/api/korean-map-extractor/kakao?address=${address}`);
    const { documents }: KakaoAddressResponse = await response.json();

    if (!documents || documents.length === 0) {
      throw new Error('주소 정보를 찾지 못했습니다');
    }

    const { x, y } = documents[0].address;
    lat = parseFloat(y);
    lng = parseFloat(x);
    name = documents[0].address_name;

    // 검색 후 자동으로 지도 그리기
    drawMap(lat, lng, name, zoom);
  };

  onMount(async () => {
    try {
      // kakao maps API가 로드될 때까지 대기
      await new Promise((resolve) => {
        const checkKakao = setInterval(() => {
          if (window.kakao && window.kakao.maps) {
            clearInterval(checkKakao);
            resolve(true);
          }
        }, 100);
      });
      kakao = window.kakao;
      const staticMapContainer = document.getElementById('map');
      if (!staticMapContainer) {
        throw new Error('지도 컨테이너를 찾을 수 없습니다.');
      }
      mapContainer = staticMapContainer;

      toast.success("Ready");
    } catch (error) {
      console.log(error)
      toast.error('카카오맵 초기화 중 오류가 발생했습니다.');
    }
  });

  $: {
    drawMap(lat, lng, name, zoom);
  }
</script>

<div class="flex flex-col items-center justify-center container pb-safe p-4">
  <div class="map-container outline-scroll" style="overflow-x: scroll; position: relative; width: 100%; height: 400px;">
    <div id="map" style={mapStyle}></div>
  </div>
  <style>
    /* Outline variant scrollbar styles */
    .outline-scroll::-webkit-scrollbar {
      height: 8px;
    }
    .outline-scroll::-webkit-scrollbar-track {
      background: transparent;
    }
    .outline-scroll::-webkit-scrollbar-thumb {
      background-color: #cbd5e0;
      border: 2px solid #edf2f7;
      border-radius: 4px;
    }
    /* Firefox */
    .outline-scroll {
      scrollbar-width: thin;
      scrollbar-color: #cbd5e0 #edf2f7;
    }
  </style>

  <style>
    @media (min-width: 768px) {
      .map-container {
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
    @media (max-width: 767px) {
      .map-container {
        display: block;
      }
    }
  </style>

  <div class="flex flex-col items-center justify-center w-full container">
    <div class="w-full max-w-full">
      <div>
        <Label>Address</Label>
          <Input
            bind:value={address}
            placeholder="지번주소 및 도로명주소를 입력해주세요"
            class="w-full"
          />
        <Button
          class="mt-4 w-full"
          disabled={isSearching}
          on:click={() => {
            if (!address.trim()) {
              toast.error('주소를 입력해주세요');
              return;
            }

            isSearching = true;
            toast.promise(
              getLocation(address)
                .finally(() => {
                  isSearching = false;
                }),
              {
                loading: '주소를 검색하는 중...',
                success: '위치를 찾았습니다',
                error: (err: any) => {
                  console.log(err)
                  return "작업을 수행할 수 없습니다. 페이지 새로고침 후 다시 시도해주세요.";
                }
              }
            );
          }}
        >
          Search
        </Button>
      </div>
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
            step="0.0001"
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
            step="0.0001"
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
      <Button
        class="mt-4 w-full"
        disabled={isDrawing}
        on:click={() => {
          isDrawing = true;
          handleDraw();
          isDrawing = false;
        }}
      >
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