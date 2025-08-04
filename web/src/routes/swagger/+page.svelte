<script lang="ts">
  import { browser } from '$app/environment';

  let fileInput: HTMLInputElement;
  let swaggerUI: any = null;

  function handleFileUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        if (!e.target) return;

        let spec;
        const content = e.target.result as string;

        // JSON 또는 YAML 파싱 시도
        if (file.name.endsWith('.json')) {
          spec = JSON.parse(content);
        } else {
          // YAML은 일단 텍스트로 처리 (YAML 파서가 필요할 경우 별도 라이브러리 추가)
          try {
            spec = JSON.parse(content);
          } catch {
            alert('YAML 파일은 현재 지원하지 않습니다. JSON 형태로 변환해주세요.');
            return;
          }
        }

        // Swagger UI 재초기화
        if (browser && (window as any).SwaggerUIBundle) {
          swaggerUI = (window as any).SwaggerUIBundle({
            spec,
            dom_id: '#swagger-ui',
            deepLinking: true,
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
      } catch (err) {
        console.error('파일 파싱 오류:', err);
        alert('올바른 OpenAPI JSON 파일이 아닙니다.');
      }
    };
    reader.readAsText(file);
  }

  function resetToDefault() {
    if (browser && (window as any).SwaggerUIBundle) {
      swaggerUI = (window as any).SwaggerUIBundle({
        url: "https://petstore.swagger.io/v2/swagger.json",
        dom_id: '#swagger-ui',
        deepLinking: true,
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

<div class="swagger-container">
  <div class="swagger-controls">
    <h1>Swagger UI</h1>
    <div class="file-controls">
      <input
        type="file"
        accept=".json,.yaml,.yml"
        bind:this={fileInput}
        on:change={handleFileUpload}
        class="file-input"
      />
      <button on:click={resetToDefault} class="reset-button">
        기본 예제로 리셋
      </button>
    </div>
  </div>

  <div id="swagger-ui"></div>
</div>

<style>
  .swagger-container {
    min-height: 100vh;
    background: #fafafa;
  }

  .swagger-controls {
    background: white;
    padding: 1rem 2rem;
    border-bottom: 1px solid #e3e3e3;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .swagger-controls h1 {
    margin: 0;
    color: #3b4151;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .file-controls {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .file-input {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: white;
    cursor: pointer;
  }

  .reset-button {
    padding: 0.5rem 1rem;
    background: #61affe;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.2s;
  }

  .reset-button:hover {
    background: #4990e2;
  }

  #swagger-ui {
    background: #fafafa;
  }

  /* 모바일 반응형 */
  @media (max-width: 768px) {
    .swagger-controls {
      flex-direction: column;
      align-items: stretch;
    }

    .file-controls {
      flex-direction: column;
    }
  }
</style>
