import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Save, X, MessageSquare } from 'lucide-react';
import { usePredefinedMessages, PredefinedMessage } from '@/hooks/usePredefinedMessages';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface PredefinedMessagesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PredefinedMessagesModal: React.FC<PredefinedMessagesModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { messages, loading, createMessage, updateMessage, deleteMessage } = usePredefinedMessages();
  const [isCreating, setIsCreating] = useState(false);
  const [editingMessage, setEditingMessage] = useState<PredefinedMessage | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', content: '' });

  const handleCreate = async () => {
    if (!formData.name.trim() || !formData.content.trim()) {
      return;
    }

    const success = await createMessage(formData.name, formData.content);
    if (success) {
      setIsCreating(false);
      setFormData({ name: '', content: '' });
    }
  };

  const handleUpdate = async () => {
    if (!editingMessage || !formData.name.trim() || !formData.content.trim()) {
      return;
    }

    const success = await updateMessage(editingMessage.id, formData.name, formData.content);
    if (success) {
      setEditingMessage(null);
      setFormData({ name: '', content: '' });
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteMessage(id);
    if (success) {
      setDeleteConfirmId(null);
    }
  };

  const startEditing = (message: PredefinedMessage) => {
    setEditingMessage(message);
    setFormData({ name: message.name, content: message.content });
    setIsCreating(false);
  };

  const cancelEditing = () => {
    setEditingMessage(null);
    setIsCreating(false);
    setFormData({ name: '', content: '' });
  };

  const startCreating = () => {
    setIsCreating(true);
    setEditingMessage(null);
    setFormData({ name: '', content: '' });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              Mensagens Pré-Definidas
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col gap-4">
            {/* Botão de criar nova mensagem */}
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Gerencie suas mensagens pré-definidas para agilizar o agendamento
              </p>
              <Button onClick={startCreating} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nova Mensagem
              </Button>
            </div>

            {/* Formulário de criação/edição */}
            {(isCreating || editingMessage) && (
              <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    {isCreating ? 'Nova Mensagem' : 'Editar Mensagem'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="message-name">Nome da Mensagem</Label>
                    <Input
                      id="message-name"
                      placeholder="Ex: Bom dia comercial, Cobrança amigável..."
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="message-content">Conteúdo da Mensagem</Label>
                    <Textarea
                      id="message-content"
                      placeholder="Digite o conteúdo da mensagem que será enviada..."
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      className="mt-1 min-h-[100px]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={isCreating ? handleCreate : handleUpdate}
                      disabled={!formData.name.trim() || !formData.content.trim()}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {isCreating ? 'Criar' : 'Salvar'}
                    </Button>
                    <Button variant="outline" onClick={cancelEditing}>
                      <X className="h-4 w-4" />
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lista de mensagens */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Carregando mensagens...</div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhuma mensagem pré-definida ainda</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Clique em "Nova Mensagem" para criar sua primeira mensagem
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {messages.map((message) => (
                    <Card key={message.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground mb-2">{message.name}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {message.content}
                            </p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEditing(message)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteConfirmId(message.id)}
                              className="h-8 w-8 p-0 hover:bg-destructive/10 hover:border-destructive/50"
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta mensagem pré-definida? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};