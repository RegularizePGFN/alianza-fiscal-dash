
// DOM manipulation utilities for PDF/PNG generation

// Hide elements marked with data-pdf-remove attribute
export const hideUnnecessaryElements = (element: HTMLElement): void => {
  const elementsToHide = element.querySelectorAll('[data-pdf-remove="true"]');
  elementsToHide.forEach(el => {
    if (el instanceof HTMLElement) {
      el.style.display = 'none';
    }
  });
};

// Show previously hidden elements
export const restoreHiddenElements = (element: HTMLElement): void => {
  const elementsToRestore = element.querySelectorAll('[data-pdf-remove="true"]');
  elementsToRestore.forEach(el => {
    if (el instanceof HTMLElement) {
      el.style.display = '';
    }
  });
};

// Set the correct page in paginated content
export const setActivePage = (element: HTMLElement, pageIndex: number): void => {
  // Find and activate the correct page
  const pageNav = element.querySelector('.pagination-content');
  if (pageNav) {
    // Simulate clicking on the correct page button if available
    const pageButtons = pageNav.querySelectorAll('[data-page]');
    const targetButton = Array.from(pageButtons).find(btn => 
      btn.getAttribute('data-page') === pageIndex.toString()
    );
    
    if (targetButton instanceof HTMLElement) {
      targetButton.click();
    }
  } else {
    // Set the current page in the DOM if no navigation buttons
    const contentDiv = element.querySelector('[data-page]');
    if (contentDiv) {
      contentDiv.setAttribute('data-page', pageIndex.toString());
    }
  }
};

// Create a temporary clone for capture
export const createTemporaryClone = (
  element: HTMLElement, 
  pageIndex: number
): { tempDiv: HTMLDivElement, cloneElement: HTMLElement } => {
  // Clone the original element
  const cloneElement = element.cloneNode(true) as HTMLElement;
  
  // Create a temporary container for this page
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'fixed';
  tempDiv.style.top = '-9999px';
  tempDiv.style.left = '-9999px';
  tempDiv.style.width = '794px';  // A4 width in pixels at 96 DPI
  tempDiv.style.height = '1123px'; // A4 height in pixels at 96 DPI
  document.body.appendChild(tempDiv);
  tempDiv.appendChild(cloneElement);
  
  // Hide navigation and buttons
  const elementsToHideInClone = cloneElement.querySelectorAll('[data-pdf-remove="true"]');
  elementsToHideInClone.forEach(el => {
    if (el instanceof HTMLElement) {
      el.style.display = 'none';
    }
  });
  
  return { tempDiv, cloneElement };
};

// Clean up temporary DOM elements
export const cleanupTemporaryElement = (tempDiv: HTMLDivElement): void => {
  document.body.removeChild(tempDiv);
};
