import { KAKAO_API_KEY } from '$env/static/private';

interface KakaoAddressResponse {
  documents: KakaoAddressDocument[];
  meta: {
    is_end: boolean;
    pageable_count: number;
    total_count: number;
  };
}

interface KakaoAddressDocument {
  address: {
    address_name: string;
    b_code: string;
    h_code: string;
    main_address_no: string;
    mountain_yn: string;
    region_1depth_name: string;
    region_2depth_name: string;
    region_3depth_h_name: string;
    region_3depth_name: string;
    sub_address_no: string;
    x: string;
    y: string;
  };
  address_name: string;
  address_type: string;
  road_address: {
    address_name: string;
    building_name: string;
    main_building_no: string;
    region_1depth_name: string;
    region_2depth_name: string;
    region_3depth_name: string;
    road_name: string;
    sub_building_no: string;
    underground_yn: string;
    x: string;
    y: string;
    zone_no: string;
  };
  x: string;
  y: string;
}

export type { KakaoAddressResponse, KakaoAddressDocument };

import type { RequestEvent } from '@sveltejs/kit';

export async function GET(event: RequestEvent): Promise<Response> {
    const url = new URL('https://dapi.kakao.com/v2/local/search/address.json');
    const address = event.url.searchParams.get('address') || '';
    url.searchParams.append('query', address);
    url.searchParams.append('page', '1');
    url.searchParams.append('size', '10');
    url.searchParams.append('analyze_type', 'similar');

    const response = await event.fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `KakaoAK ${KAKAO_API_KEY}`
      }
    });

    const data: KakaoAddressResponse = await response.json();
    return new Response(JSON.stringify(data), {
        headers: {
            'Content-Type': 'application/json'
        }
    });
}