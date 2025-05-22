
import html2canvas from 'html2canvas';
import { ExtractedData } from './types';
import { createSafeFileName, hasDates } from './helpers';
import { hideUnnecessaryElements, restoreHiddenElements, setActivePage } from './dom-utils';

export async function generateProposalPng(proposalElement: HTMLElement, data: Partial<ExtractedData>): Promise<void> {
  try {
    // Wait for a complete render cycle
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    // Wait for all fonts to load for accurate rendering
    await document.fonts.ready;
    
    // Get filename
    const fileName = createSafeFileName(data, 'png');

    // Hide elements that shouldn't appear in the export
    hideUnnecessaryElements(proposalElement);

    // Get the current page value to restore it later
    const activePageElement = proposalElement.querySelector('.active-page');
    const currentPage = activePageElement ? parseInt(activePageElement.getAttribute('data-page') || '0') : 0;
    
    // Determine total pages
    let totalPages = 1; // Start with 1 page
    try {
      if (hasDates(data)) {
        totalPages++;
      }
    } catch (error) {
      console.error('Error determining total pages:', error);
    }

    // Capture each page separately
    const pages = [];
    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      // Set the active page
      setActivePage(proposalElement, pageIndex);
        
      // Force a re-render
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Capture this page
      const canvas = await html2canvas(proposalElement, {
        scale: 2, // Better balance between quality and file size
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff',
        imageTimeout: 0,
        onclone: (documentClone) => {
          // Find and hide action buttons in the clone
          const actionButtons = documentClone.querySelectorAll('[data-pdf-remove="true"]');
          actionButtons.forEach(button => {
            if (button instanceof HTMLElement) {
              button.style.display = 'none';
            }
          });
        }
      });
      
      pages.push(canvas);
    }
    
    // Merge all canvases into a single image for download
    if (pages.length === 1) {
      // If only one page, just download it
      const link = document.createElement('a');
      link.download = fileName;
      link.href = pages[0].toDataURL('image/png', 1.0); // Maximum quality
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (pages.length > 1) {
      // If multiple pages, merge them vertically
      const totalHeight = pages.reduce((sum, canvas) => sum + canvas.height, 0);
      const mergedCanvas = document.createElement('canvas');
      mergedCanvas.width = pages[0].width;
      mergedCanvas.height = totalHeight;
      const ctx = mergedCanvas.getContext('2d');
      
      if (ctx) {
        let y = 0;
        pages.forEach(canvas => {
          ctx.drawImage(canvas, 0, y);
          y += canvas.height;
        });
        
        const link = document.createElement('a');
        link.download = fileName;
        link.href = mergedCanvas.toDataURL('image/png', 1.0); // Maximum quality
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
    
    // Restore visibility of hidden elements
    restoreHiddenElements(proposalElement);
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error generating PNG:', error);
    return Promise.reject(error);
  }
}
