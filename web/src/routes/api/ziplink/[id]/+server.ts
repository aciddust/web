import { URLExpireDays } from '$lib/constants.js';
import { getUrl } from '$lib/ziplink/implements.js';

export async function GET({ params }) {
  const { id } = params;

  const url = await getUrl(id, URLExpireDays);
  if (!url) {
    return new Response(
      JSON.stringify({
        message: 'not found',
      }),
      {
        status: 404,
        headers: {
          "content-type": "application/json",
        },
      }
    );
  }
  return new Response(
    JSON.stringify({
      "url": url,
    }),
    {
      headers: {
        "content-type": "application/json",
      },
    }
  );
}
