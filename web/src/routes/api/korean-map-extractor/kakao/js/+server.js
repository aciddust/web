import { KAKAO_JS_APIKEY } from '$env/static/private';


export async function GET(event) {
    const API_URL = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_APIKEY}&libraries=services`;
    const response = await event.fetch(API_URL);
    const finalScript = await response.text();

    return new Response(finalScript, {
        headers: {
            'Content-Type': 'application/javascript',
            'Cache-Control': 'public, max-age=3600'
        }
    });
}