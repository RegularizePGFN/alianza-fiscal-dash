
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CONTRACT_TYPE_PJ, CONTRACT_TYPE_CLT } from "@/lib/constants";

interface MonthlyGoalsFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    goal_amount?: number;
    contract_type?: string;
  };
  month: number;
  year: number;
  onClose: () => void;
}

export function MonthlyGoalsForm({ user, month, year, onClose }: MonthlyGoalsFormProps) {
  const { toast } = useToast();
  const [goalAmount, setGoalAmount] = useState(user.goal_amount?.toString() || "");
  const [contractType, setContractType] = useState(user.contract_type || CONTRACT_TYPE_PJ);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!goalAmount || isNaN(Number(goalAmount))) {
      toast({
        title: "Erro",
        description: "Por favor, insira um valor válido para a meta.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Update or insert monthly goal
      const { error: goalError } = await supabase
        .from('monthly_goals')
        .upsert({
          user_id: user.id,
          month,
          year,
          goal_amount: Number(goalAmount),
        }, {
          onConflict: 'user_id,month,year'
        });

      if (goalError) {
        console.error('Error saving goal:', goalError);
        throw goalError;
      }

      // Update user's contract type in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ contract_type: contractType })
        .eq('id', user.id);

      if (profileError) {
        console.error('Error updating contract type:', profileError);
        throw profileError;
      }

      toast({
        title: "Sucesso",
        description: `Meta e modelo de contrato atualizados para ${user.name}.`,
      });

      onClose();
    } catch (error: any) {
      console.error('Error saving data:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar as informações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar Meta e Modelo de Contrato - {user.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goalAmount">Meta para {month}/{year}</Label>
            <Input
              id="goalAmount"
              type="number"
              value={goalAmount}
              onChange={(e) => setGoalAmount(e.target.value)}
              placeholder="Ex: 15000"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contractType">Modelo de Contrato</Label>
            <Select value={contractType} onValueChange={setContractType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o modelo de contrato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={CONTRACT_TYPE_PJ}>
                  PJ - Pessoa Jurídica (20% até R$10k, 25% acima)
                </SelectItem>
                <SelectItem value={CONTRACT_TYPE_CLT}>
                  CLT - Consolidação das Leis do Trabalho (5% até R$10k, 10% acima)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
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
