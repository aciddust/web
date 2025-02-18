<script lang="ts">
  // export let data;
  import { type ISchoolDistrict, type ISchoolInfoByChosung } from '$lib/school/schedule/interfaces';
  import { selectedRegion, selectedChosung, currentSchoolPage } from '$lib/school/schedule/store';
  export let data;
  
  const districtList: ISchoolDistrict[] = data.props.districtList;
  const schoolType: string = data.props.schoolType;
  let schoolInfoByChosung: ISchoolInfoByChosung;

  const fetchSchoolInfoByRegion = async (regionCode: string) => {
    await fetch(`/api/school/${schoolType}/${regionCode}`)
      .then(res => res.json())
      .then(data => {
        schoolInfoByChosung = data.schoolInfoByChosung;
      });
  }

  const chooseRegion = async (regionCode: string) => {
    selectedRegion.set(regionCode);
    await fetchSchoolInfoByRegion(regionCode);
    selectedChosung.set('ㄱ');
    $currentSchoolPage = 1;
  }
</script>

<div>
  {#each districtList as district}
    <button on:click={() => chooseRegion(district.district_name)}>{district.district_name}</button>
  {/each}
</div>