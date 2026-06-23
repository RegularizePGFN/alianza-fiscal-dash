import { useCallback, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, X, Loader2, Clipboard } from "lucide-react";
import {
  RegistrationAttachment,
  useAddAttachment,
  useDeleteAttachment,
} from "@/hooks/useRegistrations";
import { useAuth } from "@/contexts/auth";
import { usePasteImage } from "@/hooks/usePasteImage";

interface Props {
  registrationId: string;
  items: RegistrationAttachment[];
  canManage: boolean;
}

export function AttachmentsField({ registrationId, items, canManage }: Props) {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const add = useAddAttachment();
  const del = useDeleteAttachment();

  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (!files.length || !user) return;
      setUploading(true);
      try {
        for (const file of files) {
          const ext = (file.name.split(".").pop() || "png").toLowerCase();
          const path = `${registrationId}/${crypto.randomUUID()}.${ext}`;
          const { error } = await supabase.storage
            .from("cadastro-prints")
            .upload(path, file, { contentType: file.type || "image/png" });
          if (error) throw error;
          const { data } = supabase.storage.from("cadastro-prints").getPublicUrl(path);
          await add.mutateAsync({
            registration_id: registrationId,
            file_url: data.publicUrl,
            uploaded_by: user.id,
            uploaded_by_name: user.name,
          });
        }
        toast.success("Print(s) anexado(s)");
      } catch (e: any) {
        toast.error(e.message || "Erro ao enviar");
      } finally {
        setUploading(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [registrationId, user, add]
  );

  const handleFiles = (files: FileList | null) => {
    if (files) uploadFiles(Array.from(files));
  };

  const onPasteImage = useCallback(
    (file: File) => {
      uploadFiles([file]);
    },
    [uploadFiles]
  );

  usePasteImage(onPasteImage, canManage);

  return (
    <div>
      <Label className="flex items-center gap-2">
        Prints da simulação PGFN (manual)
        {canManage && (
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
            <Clipboard className="w-3 h-3" /> Ctrl+V para colar
          </span>
        )}
      </Label>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((a) => (
          <div
            key={a.id}
            className="relative w-24 h-24 rounded-md overflow-hidden border bg-muted group"
          >
            <a href={a.file_url} target="_blank" rel="noreferrer">
              <img
                src={a.file_url}
                alt="Print simulação"
                className="w-full h-full object-cover"
              />
            </a>
            {canManage && (
              <button
                type="button"
                onClick={() => del.mutate({ id: a.id, registration_id: registrationId })}
                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                aria-label="Remover print"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
        {canManage && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-24 h-24 border-2 border-dashed rounded-md flex flex-col items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground transition"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
            <span className="text-[10px] mt-1">
              {uploading ? "Enviando" : "Adicionar"}
            </span>
          </button>
        )}
        {!canManage && !items.length && (
          <div className="text-sm text-muted-foreground">Nenhum print anexado.</div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
