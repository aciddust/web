<script lang="ts">
  import {
    date,
    selectedSchoolList,
    YYYYMMScheduleByStandardCode,
    hideSaturdayOff,
  } from '$lib/school/schedule/store';
  import { Label } from "$lib/components/ui/label/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";

	import Button from '$lib/components/ui/button/button.svelte';

  let daysInMonth = 0; // 해당 월의 일 수
  let dayOfWeek = 0; // 해당 월의 첫째 날의 요일

  // 다이얼로그 상태 관리
  let showDialog = false;
  let selectedDate: string = '';
  let selectedSchedules: Array<{ schoolName: string; colorCode: string; content: string }> = [];

  daysInMonth = new Date($date.getFullYear(), $date.getMonth() + 1, 0).getDate();
  dayOfWeek = new Date($date.getFullYear(), $date.getMonth(), 1).getDay();

  const prevMonth = () => {
    const newDate = new Date($date);
    newDate.setMonth(newDate.getMonth() - 1);
    date.set(newDate);

    // 달력 데이터 업데이트
    daysInMonth = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate();
    dayOfWeek = new Date(newDate.getFullYear(), newDate.getMonth(), 1).getDay();
  };

  const nextMonth = () => {
    const newDate = new Date($date);
    newDate.setMonth(newDate.getMonth() + 1);
    date.set(newDate);

    // 달력 데이터 업데이트
    daysInMonth = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate();
    dayOfWeek = new Date(newDate.getFullYear(), newDate.getMonth(), 1).getDay();
  };

  // resetMonth 함수도 구현
  const resetMonth = () => {
    const today = new Date();
    date.set(today);

    // 달력 데이터 업데이트
    daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    dayOfWeek = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  };

  const showYearMonthPicker = () => {};


  // Compute weeks array for the calendar grid
  // Each week is represented by an array of day numbers or null for empty cells.
  $: weeks = (() => {
    const weeks = [];
    let week = [];
    const totalCells = daysInMonth + dayOfWeek;
    for (let i = 0; i < totalCells; i++) {
      if (i < dayOfWeek) {
        week.push(null);
      } else {
        week.push(i - dayOfWeek + 1);
      }
      // When a week is complete or it's the last cell, push it to weeks
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }
    if (week.length) weeks.push(week);
    return weeks;
  })();

  // 특정 날짜의 일정을 가져오는 함수
  const getSchedulesForDate = (day: number | null) => {
    if (!day) return [];

    const year = $date.getFullYear();
    const month = ($date.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    const yyyymmdd = `${year}${month}${dayStr}`;
    const yyyymm = yyyymmdd.substring(0, 6);

    const schedules: Array<{ schoolName: string; colorCode: string; content: string }> = [];

    // 선택된 학교들의 일정 확인
    $selectedSchoolList.forEach(school => {
      if (!school.standard_code) {
        return;
      }
      const schoolSchedules = $YYYYMMScheduleByStandardCode.get(school.standard_code);
      if (schoolSchedules) {
        schoolSchedules
          .filter(schedule => {
            const scheduleDate = Array.isArray(schedule.AA_YMD)
              ? schedule.AA_YMD[0]
              : schedule.AA_YMD;
            return scheduleDate === yyyymmdd;
          })
          .forEach(schedule => {
            schedules.push({
              schoolName: school.school_name ?? '',
              colorCode: school.colorCode || '#000000',
              content: Array.isArray(schedule.EVENT_NM) ? schedule.EVENT_NM.join(', ') : schedule.EVENT_NM
            });
          });
      }
    });

    return schedules;
  };

  const handleDateClick = (day: number | null) => {
    if (!day) return;

    const year = $date.getFullYear();
    const month = ($date.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');

    selectedDate = `${year}년 ${month}월 ${dayStr}일`;
    selectedSchedules = getSchedulesForDate(day);
    showDialog = true;
  };
</script>

{#if $selectedSchoolList.length > 0}
<div>
  <div class="flex justify-center p-3 justify-between">
    <Button variant="outline" id="prev-button" on:click={() => prevMonth()}>←</Button>
    <div class="flex flex-col">
      <button
        id="year-month"
        on:click={() => showYearMonthPicker()}
      >
        {new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long' }).format($date)}
      </button>
      <div id='year-month-picker'>
      </div>
    </div>
    <Button variant="outline" id="next-button" on:click={() => nextMonth()}>→</Button>
  </div>
  <div class="flex justify-center pb-3">
    <Button variant="outline" class="font-black" on:click={() => resetMonth()}>↻</Button>
  </div>

  <div class="calendar w-full">
    <!-- Days of the week header -->
    <div class="grid grid-cols-7 gap-1">
      {#each ['일','월','화','수','목','금','토'] as dayName}
        <div class="text-center font-bold">{dayName}</div>
      {/each}
    </div>
    <!-- Calendar grid -->
    <div class="grid grid-cols-7 gap-1 mt-2">
      {#each weeks as week}
        {#each week as day, dayIndex}
          <div
            class="flex flex-col p-2 text-center rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
            role="button"
            tabindex="0"
            on:click={() => handleDateClick(day)}
            on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && handleDateClick(day)}
          >
            <!-- 날짜 표시 영역 -->
            <div class="text-right text-sm mb-1">
              {#if day}
              <span class={dayIndex === 0 ? 'text-red-400' : dayIndex === 6 ? 'text-blue-400' : ''}>
                {day}
              </span>
              {/if}
            </div>
            <!-- 일정 표시 영역 (높이 제한을 제거해서 컨텐츠가 늘어나면 전체 행의 높이가 같이 늘어나도록 함) -->
            <div class="flex flex-col gap-1">
              {#each getSchedulesForDate(day) as schedule}
              {#if $hideSaturdayOff && (schedule.content.includes("토요휴업") || schedule.content.includes("토요휴무"))}
                <!-- pass, if hiding saturday-off -->
              {:else}
                <div
                  class="text-[10px] p-1 rounded bg-white/50 truncate text-left cursor-pointer hover:bg-white"
                  style="border-left: 3px solid {schedule.colorCode}"
                  title="{schedule.schoolName}: {schedule.content}"
                >
                  <span class="font-medium">{schedule.schoolName}</span>
                  <span class="text-gray-600">: {schedule.content}</span>
                </div>
              {/if}
              {/each}
            </div>
          </div>
        {/each}
      {/each}
    </div>
  </div>
</div>
{/if}


<!-- 일정 상세 다이얼로그 -->
<Dialog.Root bind:open={showDialog}>
  <Dialog.Content class="max-w-md">
    <Dialog.Header>
      <Dialog.Title>{selectedDate}</Dialog.Title>
    </Dialog.Header>
    <div class="py-4">
      {#if selectedSchedules.length === 0}
        <p class="text-center text-gray-500">등록된 일정이 없습니다.</p>
      {:else}
        <div class="space-y-2">
          {#each selectedSchedules as schedule}
            {#if !($hideSaturdayOff && (schedule.content.includes("토요휴업") || schedule.content.includes("토요휴무")))}
              <div class="p-3 rounded-lg bg-slate-50">
                <div class="flex items-center gap-2">
                  <span style="color: {schedule.colorCode}" class="text-lg">●</span>
                  <span class="font-medium">{schedule.schoolName}</span>
                </div>
                <p class="mt-1 text-sm text-gray-600 ml-6">{schedule.content}</p>
              </div>
            {/if}
          {/each}
        </div>
      {/if}
    </div>
    <Dialog.Footer>
      <Button variant="outline" on:click={() => showDialog = false}>
        닫기
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>