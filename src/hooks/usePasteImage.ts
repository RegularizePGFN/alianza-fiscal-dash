import { useEffect } from "react";

/**
 * Listens for paste events on the document and calls onImage with each
 * pasted image file. Disabled when `enabled` is false.
 */
export function usePasteImage(
  onImage: (file: File) => void,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        if (it.kind === "file" && it.type.startsWith("image/")) {
          const file = it.getAsFile();
          if (file) {
            e.preventDefault();
            onImage(file);
          }
        }
      }
    };
    document.addEventListener("paste", handler);
    return () => document.removeEventListener("paste", handler);
  }, [onImage, enabled]);
}
