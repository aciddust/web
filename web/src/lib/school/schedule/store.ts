import { writable, type Writable} from "svelte/store";
import { type ISchoolInfo, type ISchedule } from "./interfaces";

export const date: Writable<Date> =  writable(new Date());
export const yyyyMM: Writable<string> = writable("");
export const schoolList = writable([] as ISchoolInfo[]);
export const selectedSchool = writable(null as ISchoolInfo | null);
export const selectedSchedule = writable({} as ISchedule);
export const selectedScheduleByDate = writable(new Map() as Map<string, string>);

// refactoring...

export const selectedRegion: Writable<string> = writable("");
export const selectedChosung: Writable<string> = writable("");
export const currentSchoolPage: Writable<number> = writable(1);
export const selectedSchoolList = writable([] as ISchoolInfo[]);
export const selectedScheduleBySchool = writable(new Map() as Map<string, Map<string, string>>);
export const dummyString: Writable<string> = writable("");
