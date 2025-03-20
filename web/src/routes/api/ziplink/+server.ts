import {
  URLExpireDays,
  URLPrefix,
  URLLength,
} from '$lib/constants.js';
import {
  makeRandomString,
  setUrl,
} from '$lib/ziplink/implements.js';

export async function POST({ request }) {
  const { url } = await request.json();
  if (!url) {
    return new Response(
      JSON.stringify({
        message: 'url is required',
      }),
      {
        status: 400,
        headers: {
          "content-type": "application/json",
        },
      }
    );
  }
  else if (!new URL(url).protocol.startsWith('http')) {
    return new Response(
      JSON.stringify({
        message: 'url must start with http or https',
      }),
      {
        status: 400,
        headers: {
          "content-type": "application/json",
        },
      }
    );
  }
  else if (url.length > 2048) {
    return new Response(
      JSON.stringify({
        message: 'url is too long',
      }),
      {
        status: 400,
        headers: {
          "content-type": "application/json",
        },
      }
    );
  }

  const shortenKey = makeRandomString(URLLength);
  const expiredAt = new Date().getTime() + 1000 * 60 * 60 * 24 * URLExpireDays; // after 30 days
  await setUrl(url, shortenKey, URLExpireDays);

  return new Response(
    JSON.stringify({
      // url: `${new URL(request.url).origin}/${URLPrefix}/${shortenKey}`,
      url: `https://o.z1p.link/${URLPrefix}/${shortenKey}`,
      expiredAt: new Date(expiredAt).toISOString(),
    }),
    {
      headers: {
        "content-type": "application/json",
      },
    }
  );
}
