import {
  type ISchoolInfoByChosung,
} from "$lib/school/schedule/interfaces";
import { getSchoolInfoByChosung } from "$lib/school/schedule/persistent/implements";

export async function GET({ params, url }) {
  // URL 쿼리 파라미터에서 name 가져오기
  const schoolName = url.searchParams.get('name');

  const schoolInfoByChosung: ISchoolInfoByChosung = await getSchoolInfoByChosung(
    params.type,
    params.districtCode,
    schoolName  // 세 번째 파라미터로 schoolName 전달
  );

  return new Response(
    JSON.stringify({
      "params": params,
      "query": { name: schoolName },
      "schoolInfoByChosung": schoolInfoByChosung,
    }),
    {
      headers: {
        "content-type": "application/json",
      },
    }
  );
}