import {
  type ISchoolInfoByChosung,
} from "$lib/school/schedule/interfaces";
import { getSchoolInfoByChosung } from "$lib/school/schedule/persistent/implements";

export async function GET({ params }) {
  const schoolInfoByChosung: ISchoolInfoByChosung = await getSchoolInfoByChosung(
    params.type,
    params.districtCode,
  );
  console.log(params)
  return new Response(
    JSON.stringify({
      "params": params,
      "schoolInfoByChosung": schoolInfoByChosung,
    }),
    {
      headers: {
        "content-type": "application/json",
      },
    }
  )
}