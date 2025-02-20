export interface ISchoolInfo {
  // all fields are string but can be null or undefined
  district_code: string | undefined;
  standard_code: string | undefined;
  school_name: string | undefined;
  colorCode: string | undefined;
}

export interface ISchoolDistrict {
  district_code: string;
  district_name: string;
}

export interface ISchoolInfoByChosung {
  [key: string]: Array<ISchoolInfo>;
}
export interface ISchedule {
  [key: string]: Array<string>;
}

export interface ISchoolSchedule {
  // 당장은 필요한 데이터만 사용
  // ATPT_OFCDC_SC_CODE: string
  SD_SCHUL_CODE: string,
  AY: string,
  AA_YMD: string,
  // ATPT_OFCDC_SC_NM: string,
  SCHUL_NM: string,
  // DGHT_CRSE_SC_NM: string,
  // SCHUL_CRSE_SC_NM: string,
  EVENT_NM: string,
  // EVENT_CNTNT: string,
  // ONE_GRADE_EVENT_YN: string,
  // TW_GRADE_EVENT_YN: string,
  // THREE_GRADE_EVENT_YN: string,
  // FR_GRADE_EVENT_YN: string,
  // FIV_GRADE_EVENT_YN: string,
  // SIX_GRADE_EVENT_YN: string,
  SBTR_DD_SC_NM: string,
  // LOAD_DTM: string,
}

export interface ScheduleByDate {
  [key: string]: ISchoolSchedule;
}

export interface ISchoolScheduleByDate {
  [key: string]: Array<ISchoolSchedule>;
}

export interface ISchoolScheduleResponse {
  count: string;
  schedules: Array<ISchoolSchedule>;
}
