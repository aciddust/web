import { writable, type Writable} from "svelte/store";
import { type ISchoolInfo, type ISchedule } from "./interfaces";

export const date: Writable<Date> =  writable(new Date());
export const yyyyMM: Writable<string> = writable("");

export const selectedChosung: Writable<string> = writable("");
export const currentSchoolPage: Writable<number> = writable(1);
export const selectedSchoolList = writable([] as ISchoolInfo[]);
export const selectedScheduleBySchool = writable(new Map() as Map<string, Map<string, string>>);
export const dummyString: Writable<string> = writable("");

export const currentRegionCode = writable('');
export const currentPage = writable(1);
export const currentRegionName = writable('');
export const searchKeyword = writable('');
export const itemsPerPage = writable(10);

export const currentYear = writable(new Date().getFullYear());
export const currentMonth = writable(new Date().getMonth() + 1);

export const scheduleByYYYYMM = writable(new Map() as Map<string, ISchedule[]>);
export const YYYYMMScheduleByStandardCode = writable(new Map() as Map<string, ISchedule[]>);

export const hideSaturdayOff = writable(false);