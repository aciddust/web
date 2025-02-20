<script lang="ts">
  import { slide } from 'svelte/transition';
  import Button from '$lib/components/ui/button/button.svelte';
  import {
    type ISchoolDistrict,
    type ISchoolInfoByChosung,
    type ISchoolInfo,
    type ISchedule
  } from '$lib/school/schedule/interfaces';
  import {
    selectedChosung,
    selectedSchoolList,
    currentRegionCode,
    currentRegionName,
    currentPage,
    searchKeyword,
    itemsPerPage,
    YYYYMMScheduleByStandardCode,
    scheduleByYYYYMM,
    hideSaturdayOff,
  } from '$lib/school/schedule/store';
  import { writable, type Writable } from 'svelte/store';
  import { onMount } from 'svelte';
	import Calendar from './calendar.svelte';
	import Input from '$lib/components/ui/input/input.svelte';


  export let data;
  const districtList: ISchoolDistrict[] = data.props.districtList;
  const schoolType: string = data.props.schoolType;
  let schoolInfoByChosung: Writable<ISchoolInfoByChosung> = writable({});
  let regionAreaExpanded: boolean = true;

  const fetchChosungClassifiedSchoolInfoByRegion = async (district: ISchoolDistrict, name: string | null | undefined) => {
    const query = name ? `?name=${encodeURIComponent(name)}` : '';
    await fetch(`/api/school/${schoolType}/${district.district_code}${query}`)
      .then(res => res.json())
      .then(data => {
        $schoolInfoByChosung = data.schoolInfoByChosung;
        $currentRegionCode = district.district_code;
        $currentRegionName = district.district_name;
        regionAreaExpanded = false;
      });
  }

  const chooseRegion = async (district: ISchoolDistrict) => {
    currentRegionCode.set(district.district_code);
    await fetchChosungClassifiedSchoolInfoByRegion(district, null);
    selectedChosung.set('ㄱ');
    currentPage.set(1);
  }

  // script 섹션에 추가
  function getPageNumbers(currentPage: number, totalPages: number) {
    const pages = [];
    const maxButtons = 5;

    if (totalPages <= maxButtons) {
      // 전체 페이지가 5페이지 이하면 모든 페이지 표시
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 5페이지 초과시 현재 페이지 중심으로 표시
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + 4);
      
      // end가 totalPages에 도달하지 못한 경우 start를 조정
      if (end - start < 4) {
        start = Math.max(1, end - 4);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  const fetchSchoolSchedule = async (school: ISchoolInfo) => {
    const response = await fetch(`/api/school/schedule?s=${school.standard_code}&d=${school.district_code}`);
    const data = await response.json();

    // 일정 데이터를 YYYYMM 기준으로 그룹화
    const schedulesByMonth = new Map<string, ISchedule[]>();

    data.schedules.forEach((schedule: ISchedule) => {
      const dateStr = Array.isArray(schedule.AA_YMD) ? schedule.AA_YMD[0] : schedule.AA_YMD;
      const yyyymm = dateStr.substring(0, 6);
      if (!schedulesByMonth.has(yyyymm)) {
        schedulesByMonth.set(yyyymm, []);
      }
      schedulesByMonth.get(yyyymm)?.push(schedule);
    });

    // YYYYMM별 일정 저장
    scheduleByYYYYMM.update(currentMap => {
      schedulesByMonth.forEach((schedules, yyyymm) => {
        if (!currentMap.has(yyyymm)) {
          currentMap.set(yyyymm, []);
        }
        currentMap.get(yyyymm)?.push(...schedules);
      });
      return currentMap;
    });

    // 학교별 YYYYMM 일정 저장
    YYYYMMScheduleByStandardCode.update(currentMap => {
      const key = school.standard_code!;
      if (!currentMap.has(key)) {
        currentMap.set(key, []);
      }
      currentMap.get(key)?.push(...data.schedules);
      return currentMap;
    });
  };

  // 특정 월의 모든 일정 조회
  const getMonthSchedules = (yyyymm: string) => {
    return $scheduleByYYYYMM.get(yyyymm) || [];
  };

  // 특정 학교의 모든 일정 조회
  const getSchoolSchedules = (standardCode: string) => {
    return $YYYYMMScheduleByStandardCode.get(standardCode) || [];
  };

  // 특정 날짜의 모든 일정 조회
  const getDaySchedules = (yyyymmdd: string) => {
    const yyyymm = yyyymmdd.substring(0, 6);
    return getMonthSchedules(yyyymm).filter(schedule => {
      const dateStr = Array.isArray(schedule.AA_YMD) ? schedule.AA_YMD[0] : schedule.AA_YMD;
      return dateStr === yyyymmdd;
    });
  };

  const toggleSchoolSelection = (school: ISchoolInfo) => {
    selectedSchoolList.update(schoolList => {
      if (schoolList.includes(school)) {
        return schoolList.filter(item => item !== school);
      } else {
        try {
          fetchSchoolSchedule(school);
          school.colorCode = '#' + Math.floor(Math.random() * 16777215).toString(16);
          return [...schoolList, school];
        } catch (error) {
          console.error(error);
          return schoolList;
        }
      }
    });
  };

  let searchDisabled = false;

  const executeSearch = () => {
    if (searchDisabled) return;
    searchDisabled = true;
    currentPage.set(1);
    const district = districtList.find(d => d.district_code === $currentRegionCode);
    if (district) {
      fetchChosungClassifiedSchoolInfoByRegion(district, $searchKeyword);
    }
    // Re-enable search after 1 second to prevent too many enter presses
    setTimeout(() => {
      searchDisabled = false;
    }, 1000);
  };

  onMount(async () => {});

  $: currentRegionCode
  $: currentRegionName
  $: searchKeyword
  $: schoolInfoByChosung
  $: currentPage

  $: if ($selectedChosung) {
    currentPage.set(1);
  }

  $: totalPages = $schoolInfoByChosung[$selectedChosung]
    ? Math.ceil($schoolInfoByChosung[$selectedChosung].length / $itemsPerPage)
    : 0;

  const handlePageChange = (pageNum: number) => {
    currentPage.set(pageNum);
  };
</script>

<div class="flex flex-col mx-auto space-y-4 p-4 max-w-6xl pb-safe">
  {#if regionAreaExpanded}
  <div
    class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2"
    id="region-list"
    transition:slide={{duration: 300}}
  >
    {#each districtList as district}
      <Button
        variant={$currentRegionCode === district.district_code ? 'default' : 'outline'}
        class="w-full min-w-[120px] px-4 {$currentRegionCode === district.district_code ? 'bg-primary text-primary-foreground' : ''}"
        on:click={() => chooseRegion(district)}
      >
        <span class="truncate">
          {district.district_name}
        </span>
      </Button>
    {/each}
  </div>
  {/if}

  <div class="relative">
    <div class="absolute inset-0 flex items-center" aria-hidden="true">
      <div class="w-full border-t border-gray-300"></div>
    </div>
    <div class="relative flex justify-center">
      <button
        type="button"
        class="inline-flex items-center gap-x-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        on:click={() => regionAreaExpanded = !regionAreaExpanded}
      >
        <svg
          class="h-5 w-5 transition-transform duration-200 {regionAreaExpanded ? 'rotate-180' : ''}"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
        </svg>
        {regionAreaExpanded ? '접기' : `${$currentRegionName ? $currentRegionName : '펼치기'}`}
      </button>
    </div>
  </div>

  <div class="flex flex-col space-y-4">
    <div class="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 lg:grid-cols-14 gap-1">
      {#if $schoolInfoByChosung}
        {#each Object.keys($schoolInfoByChosung) as chosung}
          <Button
            variant={$selectedChosung === chosung ? 'default' : 'outline'}
            size="sm"
            class="w-full min-w-[40px] px-2 text-sm {$selectedChosung === chosung ? 'bg-primary text-primary-foreground' : ''}"
            on:click={() => selectedChosung.set(chosung)}
          >
            <span>
              {chosung}
            </span>
          </Button>
        {/each}
      {/if}
    </div>
  </div>

  <!-- 학교 카드 영역 -->
  <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
    {#if $schoolInfoByChosung[$selectedChosung]}
      {#each $schoolInfoByChosung[$selectedChosung].slice(($currentPage - 1) * $itemsPerPage, $currentPage * $itemsPerPage) as school}
        <Button
          variant={$selectedSchoolList.includes(school) ? 'default' : 'outline'}
          size="sm"
          class="h-12 p-2 hover:scale-[1.02] transition-transform"
          on:click={() => toggleSchoolSelection(school)}
        >
          <span class="text-xs font-medium truncate">
            {school.school_name}
          </span>
        </Button>
      {/each}
    {/if}
  </div>

  <!-- 여기 검색필드+버튼을 생성할것 -->
  {#if $currentRegionCode !== ''}
  <div class="flex justify-center items-center gap-2">
    <Input
      type="text"
      class="w-full p-2 border border-gray-300 rounded-md"
      placeholder="학교명 검색"
      bind:value={$searchKeyword}
      on:keydown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          executeSearch();
        }
      }}
    />
    <Button
      variant="outline"
      size="sm"
      on:click={executeSearch}
      disabled={searchDisabled}
    >
      검색
    </Button>
  </div>
  {/if}


  {#if totalPages > 0}
  <div class="flex justify-center items-center gap-2 py-4">
    <!-- 이전 버튼 -->
    <Button
      variant="outline"
      size="sm"
      disabled={$currentPage === 1}
      on:click={() => handlePageChange($currentPage - 1)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M15 18l-6-6 6-6"/>
      </svg>
    </Button>

    <!-- 페이지 번호 -->
    <div class="flex items-center gap-1">
      {#if totalPages <= 5}
        {#each Array(totalPages) as _, i}
          <Button
            variant={$currentPage === i + 1 ? 'default' : 'outline'}
            size="sm"
            class="min-w-[32px] {$currentPage === i + 1 ? 'bg-primary text-primary-foreground' : ''}"
            on:click={() => handlePageChange(i + 1)}
          >
            {i + 1}
          </Button>
        {/each}
      {:else}
        {#each getPageNumbers($currentPage, totalPages) as num}
          <Button
            variant={$currentPage === num ? 'default' : 'outline'}
            size="sm"
            class="min-w-[32px] {$currentPage === num ? 'bg-primary text-primary-foreground' : ''}"
            on:click={() => handlePageChange(num)}
          >
            {num}
          </Button>
        {/each}
      {/if}
    </div>

    <!-- 다음 버튼 -->
    <Button
      variant="outline"
      size="sm"
      disabled={$currentPage === totalPages}
      on:click={() => handlePageChange($currentPage + 1)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </Button>
  </div>
  {/if}
  <div class="flex item-center vertical-center justify-center space-x-2">
    <Button
      variant={$hideSaturdayOff ? 'default' : 'outline'}
      size="sm"
      on:click={() => hideSaturdayOff.update(v => !v)}
    >
      { $hideSaturdayOff ? '토요일 휴무 표시' : '토요일 휴무 숨기기' }
    </Button>
    <Button
    variant="outline"
    size="sm"
    on:click={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
    >
    맨 밑으로
  </Button>
  <Button
    variant="outline"
    size="sm"
    on:click={() => selectedSchoolList.set([])}
  >
    학교 선택 해제
  </Button>
  </div>
  <Calendar />
  <div>
    <!-- 선택된 학교 목록을 나열하기위한 카드 출력 -->
    <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
      {#each $selectedSchoolList as school}
        <Button
          variant="outline"
          size="sm"
          class="h-12 p-2 hover:scale-[1.02] transition-transform"
          on:click={() => toggleSchoolSelection(school)}
        >
          <div class="flex space-x-2 items-center vertical-center">
            <span style="color: {school.colorCode}">●</span>
            <span class="text-xs font-medium truncate"> {school.school_name} </span>
          </div>
        </Button>
      {/each}
    </div>
  </div>
  <div class="flex item-center vertical-center justify-center space-x-2">
    <Button
      variant="outline"
      size="sm"
      on:click={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      맨 위로
    </Button>
  </div>
</div>


<style>
  button {
    transition: all 0.2s ease;
  }

  button:hover {
    transform: translateY(-1px);
  }

  .school-card {
    height: 60px; /* 카드 높이 축소 */
    transition: all 0.2s ease;
  }

  .school-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  }

  .school-card h3 {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  .school-card h3 {
    font-size: 0.875rem; /* 14px로 고정 */
    line-height: 1.25;
    max-width: 90%;
  }

  .school-card.selected {
    @apply bg-primary/10 border-primary;
    border-width: 1px;
  }
  /* iOS 안전 영역 대응 */
  @supports (-webkit-touch-callout: none) {
    .pb-safe {
      padding-bottom: env(safe-area-inset-bottom);
    }
  }
</style>