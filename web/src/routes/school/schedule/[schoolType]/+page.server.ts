import { getUniqueDistrictList } from "$lib/school/schedule/persistent/implements";

export async function load({ params, setHeaders }) {
  try {
    setHeaders({"Cache-Control": "public, max-age=3600, s-maxage=1" });
    const districtList = await getUniqueDistrictList(params.schoolType as string)

    return {
      status: true,
      props: {
        districtList: districtList,
        schoolType: params.schoolType,
      }
    }
  } catch (e) {
    console.error(e)
    return {
      status: false,
      props: {
        districtList: [],
        schoolType: params.schoolType
      },
      error: new Error('Failed to fetch school list')
    }
  }
}