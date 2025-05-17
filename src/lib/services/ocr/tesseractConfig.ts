
/**
 * Configuration for Tesseract OCR worker
 */
export const getTesseractConfig = (logger: (m: any) => void) => {
  return {
    logger,
    // Ensure Tesseract uses CDN-based assets to avoid loading issues
    workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@4.1.1/dist/worker.min.js',
    langPath: 'https://tessdata.projectnaptha.com/4.0.0',
    corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@4.0.4/tesseract-core.wasm.js',
    cachePath: '/tmp',
  };
};
