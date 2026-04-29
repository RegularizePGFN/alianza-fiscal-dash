import React, { useEffect, useRef } from 'react';
import { Upload, Image as ImageIcon, Sparkles, Clipboard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadDropzoneProps {
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
  hasImage?: boolean;
}

const UploadDropzone: React.FC<UploadDropzoneProps> = ({ onImageChange, disabled, hasImage }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (disabled) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file && inputRef.current) {
            const dt = new DataTransfer();
            dt.items.add(file);
            inputRef.current.files = dt.files;
            inputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
            break;
          }
        }
      }
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [disabled]);

  return (
    <label
      htmlFor="proposal-image-input"
      className={cn(
        'relative block w-full rounded-2xl border-2 border-dashed p-8 transition-all',
        'cursor-pointer overflow-hidden group',
        disabled
          ? 'border-muted bg-muted/20 cursor-not-allowed'
          : 'border-primary/30 hover:border-primary hover:bg-primary/5',
      )}
    >
      {/* Glow background */}
      <div
        aria-hidden
        className={cn(
          'absolute inset-0 opacity-0 transition-opacity pointer-events-none',
          !disabled && 'group-hover:opacity-100',
          'bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.12),transparent_60%)]',
        )}
      />

      <div className="relative flex flex-col items-center text-center gap-4">
        <div
          className={cn(
            'flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg',
            'bg-gradient-to-br from-primary to-primary/70 text-primary-foreground',
            !disabled && 'group-hover:scale-105 transition-transform',
          )}
        >
          <Upload className="h-7 w-7" />
        </div>

        <div>
          <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Envie a simulação PGFN
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Arraste, clique ou cole (Ctrl+V) uma imagem da simulação
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-muted-foreground">
            <ImageIcon className="h-3 w-3" />
            PNG · JPG · JPEG
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-muted-foreground">
            <Clipboard className="h-3 w-3" />
            Ctrl + V
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-muted-foreground">
            até 10 MB
          </span>
        </div>

        <input
          id="proposal-image-input"
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={onImageChange}
          disabled={disabled}
          className="hidden"
        />
      </div>
    </label>
  );
};

export default UploadDropzone;
