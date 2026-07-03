/**
 * Pyodide integration — runs real Python (numpy, pandas, scikit-learn) in the browser.
 * Lazy-loads on first use. Zero backend, zero install.
 *
 * Ported from ml-systems-lab/src/python.js. Framework-agnostic. Exports:
 *   loadPython(onProgress)  — lazy singleton, resolves to the Pyodide instance
 *   runPython(code, globals) -> { ok, stdout, error, result }
 *   isPyodideReady()        — true once loaded
 */

let pyodideInstance = null
let loadingPromise = null

export function isPyodideReady() {
  return pyodideInstance !== null
}

export async function loadPython(onProgress) {
  if (pyodideInstance) return pyodideInstance
  if (loadingPromise) return loadingPromise

  loadingPromise = (async () => {
    onProgress?.('Loading Python runtime...')

    // Load Pyodide from CDN
    await loadScript('https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js')

    onProgress?.('Initialising Python...')
    // eslint-disable-next-line no-undef
    pyodideInstance = await loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/',
    })

    onProgress?.('Loading numpy + pandas...')
    await pyodideInstance.loadPackage(['numpy', 'pandas'])

    onProgress?.('Loading scikit-learn...')
    await pyodideInstance.loadPackage(['scikit-learn'])

    onProgress?.('Ready!')
    return pyodideInstance
  })()

  return loadingPromise
}

export async function runPython(code, globals = {}) {
  if (!pyodideInstance) throw new Error('Python not loaded yet')

  // Inject any globals
  for (const [k, v] of Object.entries(globals)) {
    pyodideInstance.globals.set(k, v)
  }

  // Capture stdout
  let stdout = ''
  pyodideInstance.setStdout({ batched: s => { stdout += s + '\n' } })

  try {
    const result = await pyodideInstance.runPythonAsync(code)
    return { ok: true, result, stdout: stdout.trim() }
  } catch (err) {
    return { ok: false, error: err.message, stdout: stdout.trim() }
  }
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
    const s = document.createElement('script')
    s.src = src
    s.onload = resolve
    s.onerror = reject
    document.head.appendChild(s)
  })
}
