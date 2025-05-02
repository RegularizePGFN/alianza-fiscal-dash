
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";

interface User {
  id: string;
  name: string;
  email: string;
  goal_amount?: number;
}

interface MonthlyGoalsFormProps {
  user: User;
  month: number;
  year: number;
  onClose: () => void;
}

// Define the form schema
const formSchema = z.object({
  goal_amount: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().min(0, "Meta não pode ser negativa").optional()
  ),
});

export function MonthlyGoalsForm({ user, month, year, onClose }: MonthlyGoalsFormProps) {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      goal_amount: user.goal_amount,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      // Check if a goal entry already exists for this user/month/year
      const { data: existingGoal, error: fetchError } = await supabase
        .from('monthly_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', month)
        .eq('year', year)
        .maybeSingle();

      if (fetchError) throw fetchError;

      let result;

      if (existingGoal) {
        // Update existing goal
        result = await supabase
          .from('monthly_goals')
          .update({ goal_amount: values.goal_amount })
          .eq('id', existingGoal.id);
      } else {
        // Create new goal
        result = await supabase
          .from('monthly_goals')
          .insert({
            user_id: user.id,
            month,
            year,
            goal_amount: values.goal_amount,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }

      if (result.error) throw result.error;

      // Create a notification for the user
      const notificationResult = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          message: `Sua meta mensal para ${month}/${year} foi ${existingGoal ? 'atualizada' : 'definida'} como R$ ${values.goal_amount?.toLocaleString('pt-BR')}.`,
          type: 'goal_update',
          read: false
        });

      if (notificationResult.error) {
        console.error('Error creating notification:', notificationResult.error);
      }

      toast({
        title: "Meta atualizada com sucesso",
        description: `A meta de ${user.name} foi atualizada.`,
      });

      onClose();
    } catch (error: any) {
      console.error('Error saving goal:', error);
      toast({
        title: "Erro ao salvar meta",
        description: error.message || "Não foi possível salvar a meta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar Meta Mensal</CardTitle>
        <CardDescription>
          Definir meta para {user.name} referente ao mês {month}/{year}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="goal_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor da Meta (R$)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite o valor da meta"
                      type="number"
                      min="0"
                      step="100"
                      {...field}
                      value={field.value === undefined ? '' : field.value}
                      onChange={(e) => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Defina a meta de vendas em reais.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={onClose} type="button">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
