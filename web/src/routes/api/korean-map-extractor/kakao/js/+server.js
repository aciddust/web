import { KAKAO_JS_APIKEY } from '$env/static/private';


export async function GET(event) {
    const API_URL = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_APIKEY}&libraries=services`;
    const response = await event.fetch(API_URL);
    const combinedScript = await response.text();

    // Split the returned text if multiple scripts are present.
    // Replace '/* SCRIPT DELIMITER */' with the actual delimiter if available.
    const scripts = combinedScript.includes('/* SCRIPT DELIMITER */')
        ? combinedScript.split('/* SCRIPT DELIMITER */').map(script => script.trim())
        : [combinedScript];

    // Optionally process each script here before combining
    const finalScript = scripts.join('\n');

    return new Response(finalScript, {
        headers: {
            'Content-Type': 'application/javascript',
            'Cache-Control': 'public, max-age=3600'
        }
    });
}