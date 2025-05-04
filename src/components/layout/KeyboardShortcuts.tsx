
import { useEffect } from 'react';

interface KeyboardShortcutsProps {
  onSearchOpen: () => void;
}

export function KeyboardShortcuts({ onSearchOpen }: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Command+K ou Ctrl+K para abrir busca global
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        onSearchOpen();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onSearchOpen]);

  return null;
}
