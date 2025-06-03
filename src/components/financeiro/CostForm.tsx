
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CostFormProps {
  cost?: any;
  costType: 'fixed' | 'variable';
  onSave: () => void;
  onCancel: () => void;
}

export function CostForm({ cost, costType, onSave, onCancel }: CostFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: cost?.name || "",
    description: cost?.description || "",
    amount: cost?.amount?.toString() || "",
    category: cost?.category || "",
    start_date: cost?.start_date || "",
    end_date: cost?.end_date || ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.amount) {
      toast({
        title: "Erro",
        description: "Nome e valor são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const costData = {
        name: formData.name,
        description: formData.description,
        amount: parseFloat(formData.amount),
        category: formData.category,
        type: costType,
        start_date: costType === 'variable' && formData.start_date ? formData.start_date : null,
        end_date: costType === 'variable' && formData.end_date ? formData.end_date : null
      };

      if (cost?.id) {
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
          .insert(costData);

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
        <CardTitle>
          {cost ? "Editar" : "Adicionar"} Custo {costType === 'fixed' ? 'Fixo' : 'Variável'}
        </CardTitle>
        <CardDescription>
          {costType === 'fixed' 
            ? "Custos recorrentes mensais como aluguel, salários, etc."
            : "Custos com período determinado como parcelas, funcionários temporários, etc."
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Aluguel do escritório"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Valor *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0,00"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="administrativo">Administrativo</SelectItem>
                <SelectItem value="operacional">Operacional</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="tecnologia">Tecnologia</SelectItem>
                <SelectItem value="pessoal">Pessoal</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {costType === 'variable' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Data de Início</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">Data de Término</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição opcional do custo"
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
