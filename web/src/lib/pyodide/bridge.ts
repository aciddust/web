const moduleLoader = (moduleName: string) => `
import importlib.util
spec = importlib.util.spec_from_file_location('${moduleName}', '${moduleName}.pyc')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
`

const codeGenerator = (moduleName: string, code: string) => `
${moduleLoader(moduleName)}
${code}
`

export const getClientCode = async (moduleName: string, clientFilePath: string) => {
  // get code as text
  console.log('targetURL -> ', clientFilePath)
  const response = await fetch(clientFilePath);
  const code = await response.text();
  // generate code
  return codeGenerator(moduleName, code);
}

export const saveB64AsBinary = (b64: string, filename: string) => `
import base64

binary = base64.b64decode("""${b64}""")
with open("${filename}", "wb") as file:
  file.write(binary)
`


const arrayBufferToBase64 = (buffer: Uint8Array) => {
  const encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const bytes = new Uint8Array(buffer);
  const byteLength = bytes.byteLength;
  const byteRemainder = byteLength % 3;
  const mainLength = byteLength - byteRemainder;
  let base64 = '';

  let a, b, c, d, chunk;
  for (let i = 0; i < mainLength; i += 3) {
    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    a = (chunk >> 18) & 63;
    b = (chunk >> 12) & 63;
    c = (chunk >> 6) & 63;
    d = chunk & 63;
    base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
  }

  if (byteRemainder === 1) {
    chunk = bytes[mainLength];
    a = (chunk >> 2) & 63;
    b = (chunk & 3) << 4;
    base64 += encodings[a] + encodings[b] + '==';
  } else if (byteRemainder === 2) {
    chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];
    a = (chunk >> 10) & 63;
    b = (chunk >> 4) & 63;
    c = (chunk & 15) << 2;
    base64 += encodings[a] + encodings[b] + encodings[c] + '=';
  }

  return base64;
}

export const loadExternalFileAsBytes = async (fileUrl: string) => {
  const response = await fetch(fileUrl);
  const fileContent: ArrayBuffer = await response.arrayBuffer();
  const newBytes: Uint8Array = new Uint8Array(fileContent);
  const base64: string = arrayBufferToBase64(newBytes);
  return base64;
}

export async function runPython(pyodide: any, code: string) {
  if (!pyodide) return;
  try {
      return await pyodide.runPythonAsync(code);
  } catch (error) {
      console.error("Python 코드 실행 실패:", error);
  }
}
