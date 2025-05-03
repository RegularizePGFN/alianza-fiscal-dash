
import React, { useState, useCallback } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface DeleteSaleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

export function DeleteSaleDialog({ 
  isOpen, 
  onClose, 
  onDelete, 
  isDeleting = false 
}: DeleteSaleDialogProps) {
  const [isClosing, setIsClosing] = useState(false);
  
  const handleOpenChange = useCallback((open: boolean) => {
    if (!open && !isDeleting && !isClosing) {
      setIsClosing(true);
      // Small delay to prevent UI freezes during state transitions
      setTimeout(() => {
        onClose();
        setIsClosing(false);
      }, 100);
    }
  }, [onClose, isDeleting, isClosing]);
  
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onDelete();
  }, [onDelete]);
  
  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm deletion</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this sale? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting || isClosing}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete} 
            className="bg-destructive text-destructive-foreground"
            disabled={isDeleting || isClosing}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
