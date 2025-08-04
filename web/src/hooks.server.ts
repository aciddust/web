import type { Handle, HandleServerError } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const ignorePaths = [ // Chrome DevTools, Browser auto-requests to static files
    '.well-known',
    'favicon.ico',
    'robots.txt',
    'sitemap.xml',
    'apple-touch-icon',
    'android-chrome',
    'browserconfig.xml',
    'manifest.json'
  ];

  if (ignorePaths.some(path => event.url.pathname.includes(path))) {
    return new Response('', { status: 404 });
  }

  return await resolve(event);
};

export const handleError: HandleServerError = async ({ error, event }) => {
  // keep silent for 404 errors
  const errorMessage = error instanceof Error ? error.message : String(error);

  if (errorMessage?.includes('Not found') &&
      (event.url.pathname.includes('.well-known') ||
       event.url.pathname.includes('favicon.ico'))) {
    return {
      message: 'File not found'
    };
  }

  console.error('Server error:', error);
  return {
    message: 'Internal server error'
  };
};

/*
  개발과정에서 브라우저가 ignorePaths 에 정의된 파일경로들에 대하여 계속 요청하면서 404 로그를 남기고있는데
  대부분 애플리케이션 동작에 영향을 주지 않는 부수적인 요청들임
  따라서 이 요청들에 대해서는 404 응답을 조용히 보내도록 처리하기 위해 에러 핸들러를 작성함
*/
