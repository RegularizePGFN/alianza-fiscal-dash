
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CostFormProps {
  cost?: any;
  onSave: () => void;
  onCancel: () => void;
}

export function CostForm({ cost, onSave, onCancel }: CostFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    type: 'fixed' as 'fixed' | 'variable',
    category: ''
  });

  useEffect(() => {
    if (cost) {
      setFormData({
        name: cost.name || '',
        description: cost.description || '',
        amount: cost.amount?.toString() || '',
        type: cost.type || 'fixed',
        category: cost.category || ''
      });
    }
  }, [cost]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const costData = {
        name: formData.name,
        description: formData.description,
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.category || null
      };

      if (cost) {
        const { error } = await supabase
          .from('company_costs')
          .update(costData)
          .eq('id', cost.id);

        if (error) throw error;

        toast({
          title: "Custo atualizado",
          description: "O custo foi atualizado com sucesso."
        });
      } else {
        const { error } = await supabase
          .from('company_costs')
          .insert([costData]);

        if (error) throw error;

        toast({
          title: "Custo adicionado",
          description: "O custo foi adicionado com sucesso."
        });
      }

      onSave();
    } catch (error: any) {
      console.error('Erro ao salvar custo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o custo.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{cost ? 'Editar Custo' : 'Adicionar Novo Custo'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Custo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={formData.type} onValueChange={(value: 'fixed' | 'variable') => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Custo Fixo</SelectItem>
                  <SelectItem value="variable">Custo Variável</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Categoria (opcional)</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Ex: Marketing, Aluguel, etc."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição detalhada do custo"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : (cost ? 'Atualizar' : 'Adicionar')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
