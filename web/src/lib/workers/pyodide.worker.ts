import { loadPyodide } from 'pyodide';
import type { PyodideInterface } from 'pyodide';

import {
  PYODIDE_URL,
  PYODIDE_ROUTES,
} from '$lib/constants';

import {
  runPython,
  getClientCode,
  saveB64AsBinary,
  loadExternalFileAsBytes,
} from '$lib/pyodide/bridge';

const SERVICE_NAME = 'wordcloud-generator';
let pyodide: PyodideInterface;
let moduleName = PYODIDE_ROUTES[SERVICE_NAME].module;
const clientFilePath = PYODIDE_ROUTES[SERVICE_NAME].clientFilePath;
let code = ''

self.onmessage = async (e: MessageEvent) => {
  const { type, payload } = e.data;

  try {
    switch (type) {
      case 'INIT':
        const { host, pathname, protocol } = payload;
        pyodide = await loadPyodide({ indexURL: PYODIDE_URL });
        await pyodide.loadPackage('micropip');
        const micropip = pyodide.pyimport('micropip');
        await micropip.install('numpy');
        await micropip.install('pillow');
        await micropip.install('wordcloud');
        console.log('host -> ', host)
        console.log('pathname -> ', pathname)
        console.log('protocol -> ', protocol)

        const hostURL = `${protocol}//${host}${pathname}`

        await pyodide.runPythonAsync(
          await saveB64AsBinary(
            await loadExternalFileAsBytes(`${hostURL}/${moduleName}`),
            `${moduleName}.pyc`,
          )
        );
        // await pyodide.runPythonAsync(
        //   await saveB64AsBinary(
        //     await loadExternalFileAsBytes("PretendardVariable.ttf"),
        //     "PretendardVariable.ttf",
        //   )
        // )
        const mangeldClientFilePath = `${hostURL}/${clientFilePath}`
        code = await getClientCode(moduleName, mangeldClientFilePath)
        console.log('code -> ', code)
        // 초기화 완료 메시지 전송
        self.postMessage({ type: 'INIT_COMPLETE' });
        break;

      case 'GENERATE':
        const { input, stopwords } = payload;
        console.log('code', code);
        console.log('input', input);
        console.log('stopwords', stopwords);

        // 워드클라우드 생성 로직 실행
        const newCode = `${code}\nfunc(module, """${input}""", """${stopwords}""")`;
        await pyodide.runPythonAsync(newCode);

        // 이미지 데이터 읽기 및 변환
        const imgData = await pyodide.FS.readFile('result.png');

        // 결과 전송
        self.postMessage({
          type: 'GENERATE_COMPLETE',
          payload: imgData
        });
        break;
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      payload: error instanceof Error ? error.message : String(error)
    });
  }
};