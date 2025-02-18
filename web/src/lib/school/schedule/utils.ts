import { type ISchoolInfo, type ISchedule } from "./interfaces";

export const getChosung = (initial: string) => {
  // 초성을 반환하는 함수
  const chosung = [
    "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ",
    "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ",
    "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ",
    "ㅋ", "ㅌ", "ㅍ", "ㅎ"
  ]
  const unicode = initial.charCodeAt(0)
  const chosungIndex = Math.floor((unicode - 44032) / 588)
  return chosung[chosungIndex]
}

export const getClassifiedSchoolMap = (schoolList: ISchoolInfo[]): Map<string, ISchoolInfo[]> => {
  // 첫글자 ㄱ, ㄴ, ㄷ, ㄹ, ㅁ, ㅂ, ㅅ, ㅇ, ㅈ, ㅊ, ㅋ, ㅌ, ㅍ, ㅎ 순서대로 분류된 Map을 만들어서 반환
  const schoolMap = new Map<string, ISchoolInfo[]>()
  schoolList.forEach((school) => {
    const initial = school.school_name[0]
    const chosung = getChosung(initial)
    // console.debug("chosung -> ", initial, chosung)
    if (!schoolMap.has(chosung)) {
      schoolMap.set(chosung, [])
    }
    const schools = schoolMap.get(chosung)
    if (!schools) {
      return
    }
    schools.push(school)
    schoolMap.set(chosung, schools)
  })
  return schoolMap
}

const formatDateString = (date: string): string => {
  const year = date.slice(0, 4);
  const month = date.slice(4, 6);
  const day = date.slice(6, 8);
  return `${year}-${month}-${day}`;
}

export const padZero = (value: number): string => {
  const formattedMonth = ("0" + (value)).slice(-2);
  return formattedMonth;
}

const splitHugeRange = (dateArray: string[]) => {
  // NOTE: not tested
  // 20240429, 20240430, ... 20240530 이렇게 한 범위에 대한 값이 있고
  // 20240620, 20240621, ... 20240730 이렇게 한 범위에 대한 값이
  // {"중간고사": ["20240429", ... "20240730"]} 이렇게 하나로 합쳐져있을 때
  // 중간고사: 20240429 ~ 20240530, 20240620 ~ 20240730 이렇게 분리해서 반환
  const result = [];
  let start = dateArray[0];
  let end = dateArray[0];
  for (let i = 1; i < dateArray.length; i++) {
    if (parseInt(dateArray[i]) - parseInt(dateArray[i - 1]) !== 1) {
      result.push([start, end]);
      start = dateArray[i];
    }
    end = dateArray[i];
  }
  result.push([start, end]);
  return result;
}

export const summaryDateArray = (dateArray: string[]) => {
  if (dateArray.length === 0) return '없음';
  if (dateArray.length === 1) return formatDateString(dateArray[0]);
  return `${formatDateString(dateArray[0])} ~ ${formatDateString(dateArray[dateArray.length - 1])}`;
}

export const classifyScheduleByMonth = (schedule: ISchedule ): Map<string, ISchedule> => {
  const scheduleByMonth = new Map<string, ISchedule>();
  for (const [eventName, dateArray] of Object.entries(schedule)) {
    for (const date of dateArray) {
      const month = date.slice(0, 6);
      if (!scheduleByMonth.has(month)) {
        scheduleByMonth.set(month, {});
      }
      const monthSchedule = scheduleByMonth.get(month);
      if (!monthSchedule) {
        return new Map<string, ISchedule>();
      }
      if (!monthSchedule[eventName]) {
        monthSchedule[eventName] = [];
      }
      monthSchedule[eventName].push(date);
      scheduleByMonth.set(month, monthSchedule);
    }
  }
  return scheduleByMonth;
}

export const classifyScheduleByDate = (schedule: ISchedule): Map<string, string> => {
  const scheduleByDate = new Map<string, string>();
  for (const [eventName, dateArray] of Object.entries(schedule)) {
    for (const date of dateArray) {
      scheduleByDate.set(date, eventName);
    }
  }
  return scheduleByDate;
}
