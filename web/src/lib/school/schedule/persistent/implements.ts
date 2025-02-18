import { getDB } from "./connection";
import {
  type ISchoolInfo,
  type ISchoolInfoByChosung,
  type ISchoolDistrict,
} from "$lib/school/schedule/interfaces";
import { getChosung } from "$lib/school/schedule/utils";
import _ from 'lodash'

export const getSchoolInfoByChosung = _.memoize(
  async (schoolType: string, districtCode: string): Promise<ISchoolInfoByChosung> => {
    console.log(`getSchoolInfoByChosung: called!! -> ${schoolType} ${districtCode}`)
    const db = await getDB();
    const schoolInfoList = await db.all<ISchoolInfo[]>(
      "SELECT district_code, standard_code, school_name FROM school_info WHERE school_type like ? AND district_code = ?", [schoolType, districtCode]
    );
    await db.close();
    const schoolInfoByChosung: ISchoolInfoByChosung = {};
    for (const schoolInfo of schoolInfoList) {
      if (!schoolInfo.school_name) {
        continue;
      }
      const firstCharacter = schoolInfo.school_name[0];
      const chosung = getChosung(firstCharacter);
      if (!schoolInfoByChosung[chosung]) {
        schoolInfoByChosung[chosung] = [];
      }
      schoolInfoByChosung[chosung].push(schoolInfo);
    }
    return schoolInfoByChosung;
  },
  // custom resolver
  (schoolType, districtCode) => `${schoolType}-${districtCode}`
)


export const getUniqueDistrictList = _.memoize(
  async (schoolType: string): Promise<Array<ISchoolDistrict>> => {
    // memoize를 사용하여 같은 schoolType에 대한 중복된 쿼리요청을 하지 않습니다.
    const db = await getDB();
    const districtNameByCode = await db.all<Array<ISchoolDistrict>>(
      // school
      "SELECT distinct district_code, district_name FROM school_info WHERE school_type like ?", [schoolType]
    );
    console.log("getUniqueDistrictList: called!!")
    await db.close();
    // district_name에 포함된 '교육청'이라는 단어를 제거
    districtNameByCode.forEach((district: ISchoolDistrict) => {
      district.district_name = district.district_name.replace("교육청", "")
    })
    return districtNameByCode;
  },
);
