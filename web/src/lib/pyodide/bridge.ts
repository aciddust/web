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


const arrayBufferToBase64 = (buffer: Uint8Array<ArrayBuffer>) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export const loadExternalFileAsBytes = async (fileUrl: string) => {
  const response = await fetch(fileUrl);
  const fileContent = await response.arrayBuffer();
  const bytes = new Uint8Array(fileContent);
  const base64 = arrayBufferToBase64(bytes);
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
