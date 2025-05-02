
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { MonthlyGoalsForm } from "@/components/settings/MonthlyGoalsForm";

interface UserWithGoal {
  id: string;
  name: string;
  email: string;
  role: string;
  goal_amount?: number;
}

export function MonthlyGoalsSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserWithGoal[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserWithGoal | null>(null);
  const [editFormVisible, setEditFormVisible] = useState(false);
  
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Fetch all users (excluding the admin viewing the page)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      // Fetch all monthly goals for the current month/year
      const { data: goals, error: goalsError } = await supabase
        .from('monthly_goals')
        .select('*')
        .eq('month', currentMonth)
        .eq('year', currentYear);

      if (goalsError) throw goalsError;

      // Merge the data
      const usersWithGoals = profiles.map(user => {
        const userGoal = goals?.find(g => g.user_id === user.id);
        return {
          ...user,
          goal_amount: userGoal?.goal_amount || undefined
        };
      });

      setUsers(usersWithGoals);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "Erro ao carregar usuários",
        description: error.message || "Não foi possível carregar os usuários. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user: UserWithGoal) => {
    setSelectedUser(user);
    setEditFormVisible(true);
  };

  const handleFormClose = () => {
    setEditFormVisible(false);
    setSelectedUser(null);
    fetchUsers(); // Refresh the list after editing
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Metas Mensais dos Vendedores</CardTitle>
          <CardDescription>
            Defina as metas mensais para cada vendedor para o mês atual ({currentMonth}/{currentYear})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center p-2 border rounded-md">
                  <div className="flex-1">
                    <Skeleton className="h-5 w-40 mb-1" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-9 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {users.filter(user => user.role === 'vendedor').map((user) => (
                <div key={user.id} className="flex justify-between items-center p-3 border rounded-md hover:bg-accent/10 transition-colors">
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">
                      {user.goal_amount ? `R$ ${user.goal_amount.toLocaleString('pt-BR')}` : 'Sem meta definida'}
                    </span>
                    <Button size="sm" onClick={() => handleEditClick(user)}>
                      Editar
                    </Button>
                  </div>
                </div>
              ))}

              {users.filter(user => user.role === 'vendedor').length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  Nenhum vendedor encontrado no sistema.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {editFormVisible && selectedUser && (
        <MonthlyGoalsForm 
          user={selectedUser} 
          month={currentMonth} 
          year={currentYear} 
          onClose={handleFormClose} 
        />
      )}
    </div>
  );
}
