<script lang="ts">
  import { page } from '$app/state';
  import { slide } from 'svelte/transition';
  import Button from '$lib/components/ui/button/button.svelte';
  import { type ISchoolDistrict, type ISchoolInfoByChosung, type ISchoolInfo } from '$lib/school/schedule/interfaces';
  import { selectedRegion, selectedChosung } from '$lib/school/schedule/store';
  import { writable, type Writable } from 'svelte/store';
  import { onMount } from 'svelte';

  export let data;
  const districtList: ISchoolDistrict[] = data.props.districtList;
  const schoolType: string = data.props.schoolType;
  let schoolInfoByChosung: Writable<ISchoolInfoByChosung> = writable({});
  let regionAreaExpanded: boolean = true;
  const currentRegionCode = writable('');
  const currentRegionName = writable('');
  const searchKeyword = writable('');
  const currentPage = writable(1);
  const itemsPerPage = writable(10);

  const selectedSchoolList = writable<ISchoolInfo[]>([]);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const fetchChosungClassifiedSchoolInfoByRegion = async (district: ISchoolDistrict) => {
    await fetch(`/api/school/${schoolType}/${district.district_code}`)
      .then(res => res.json())
      .then(data => {
        $schoolInfoByChosung = data.schoolInfoByChosung;
        $currentRegionCode = district.district_code;
        $currentRegionName = district.district_name;
        regionAreaExpanded = false;
      });
  }

  const chooseRegion = async (district: ISchoolDistrict) => {
    selectedRegion.set(district.district_code);
    await fetchChosungClassifiedSchoolInfoByRegion(district);
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

  const toggleSchoolSelection = (school: ISchoolInfo) => {
    selectedSchoolList.update(schoolList => {
      if (schoolList.includes(school)) {
        return schoolList.filter(item => item !== school);
      } else {
        return [...schoolList, school];
      }
    });
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

<div class="flex flex-col mx-auto space-y-4">
  {#if regionAreaExpanded}
  <div
    class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2"
    id="region-list"
    transition:slide={{duration: 300}}
  >
    {#each districtList as district}
      <Button
        variant={$selectedRegion === district.district_code ? 'default' : 'outline'}
        class="w-full min-w-[120px] px-4 {$selectedRegion === district.district_code ? 'bg-primary text-primary-foreground' : ''}"
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
</style>