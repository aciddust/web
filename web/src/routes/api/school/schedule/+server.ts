import { type ISchoolSchedule } from '$lib/school/schedule/interfaces';
import { NEIS_API_KEY } from '$env/static/private';

export async function GET({ fetch, url }) {
  const standardCode = url.searchParams.get('s');
  const districtCode = url.searchParams.get('d');

  const nowYear = new Date().getFullYear();
  const nextYear = nowYear + 1;

  const queries: Record<string, string> = {
    "Type": "json",
    "pIndex": "1",
    "pSize": "1000",
    "KEY": NEIS_API_KEY,
    "ATPT_OFCDC_SC_CODE": districtCode ?? "",
    "SD_SCHUL_CODE": standardCode ?? "",
    "AA_FROM_YMD": nowYear.toString(),
    "AA_TO_YMD": nextYear.toString(),
  };

  const NEIS_ENDPOINT = "https://open.neis.go.kr/hub/SchoolSchedule"
  const params = new URLSearchParams(queries);
  const FETCH_URL = `${NEIS_ENDPOINT}?${params}`;
  console.log(FETCH_URL)
  const response = await fetch(FETCH_URL);
  const rawJsonText = await response.text();
  // text to json conversion
  const data = JSON.parse(rawJsonText);
  const head = data.SchoolSchedule[0].head;
  const body = data.SchoolSchedule[1].row;
  return new Response(
    JSON.stringify(
      {
        count: head[0].list_total_count,
        schedules: body.map((schedule: ISchoolSchedule) => {
          return {
            SD_SCHUL_CODE: schedule.SD_SCHUL_CODE,
            AY: schedule.AY,
            AA_YMD: schedule.AA_YMD,
            SCHUL_NM: schedule.SCHUL_NM,
            EVENT_NM: schedule.EVENT_NM,
            SBTR_DD_SC_NM: schedule.SBTR_DD_SC_NM,
          }
        })
      }
    ),
    {
      headers: {
        "content-type": "application/json",
      },
    }
  )
}