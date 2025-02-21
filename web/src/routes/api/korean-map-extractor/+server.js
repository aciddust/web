import { KAKAO_JS_APIKEY } from '$env/static/private';


export async function GET(event) {
    const API_URL = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_APIKEY}`;
    const response = await event.fetch(API_URL);
    const script = await response.text();

    return new Response(script, {
        headers: {
            'Content-Type': 'application/javascript',
            'Cache-Control': 'public, max-age=3600' // 캐싱 설정
        }
    });
}