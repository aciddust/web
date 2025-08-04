<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  onMount(() => {
    if (browser) {
      // CSS 동적 로드
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.type = 'text/css';
      cssLink.href = '/swagger/swagger-ui.css';
      document.head.appendChild(cssLink);

      loadSwaggerScripts();
    }
  });

  function loadSwaggerScripts() {
    // Swagger UI 스크립트 순서대로 로드
    const scripts = [
      '/swagger/swagger-ui-bundle.js',
      '/swagger/swagger-ui-standalone-preset.js'
    ];

    let loadedCount = 0;

    scripts.forEach((src, index) => {
      const script = document.createElement('script');
      script.src = src;
      script.type = 'text/javascript';
      script.onload = () => {
        loadedCount++;
        if (loadedCount === scripts.length) {
          // 모든 스크립트가 로드되면 Swagger UI 초기화
          initSwaggerUI();
        }
      };
      document.head.appendChild(script);
    });
  }

  function initSwaggerUI() {
    if (typeof (window as any).SwaggerUIBundle !== 'undefined') {
      (window as any).ui = (window as any).SwaggerUIBundle({
        url: "https://petstore.swagger.io/v2/swagger.json", // 예제 URL
        dom_id: '#swagger-ui',
        deepLinking: true,
        supportedSubmitMethods: [],
        presets: [
          (window as any).SwaggerUIBundle.presets.apis,
          (window as any).SwaggerUIStandalonePreset
        ],
        plugins: [
          (window as any).SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout"
      });
    }
  }
</script>

<svelte:head>
  <title>Swagger UI</title>
</svelte:head>

<slot />