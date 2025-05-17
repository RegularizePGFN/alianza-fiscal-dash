
import { createCanvas, Canvas } from 'canvas';

/**
 * Preprocesses an image for better OCR results by converting to grayscale and increasing contrast
 */
export const preprocessImageData = async (imageUrl: string): Promise<HTMLCanvasElement> => {
  // Create a canvas to manipulate the image
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  // Load the image
  const img = new Image();
  img.crossOrigin = 'Anonymous';
  
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = imageUrl;
  });
  
  // Set canvas dimensions
  canvas.width = img.width;
  canvas.height = img.height;
  
  // Draw original image
  ctx.drawImage(img, 0, 0);
  
  // Apply image preprocessing:
  // 1. Convert to grayscale
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i] = avg; // r
    data[i + 1] = avg; // g
    data[i + 2] = avg; // b
  }
  
  // 2. Increase contrast
  const contrast = 1.5; // Adjust as needed
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  
  for (let i = 0; i < data.length; i += 4) {
    data[i] = factor * (data[i] - 128) + 128;
    data[i + 1] = factor * (data[i + 1] - 128) + 128;
    data[i + 2] = factor * (data[i + 2] - 128) + 128;
  }
  
  // Put the processed image back
  ctx.putImageData(imageData, 0, 0);
  
  return canvas;
};
