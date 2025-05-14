
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { MonthlyGoalsForm } from "@/components/settings/MonthlyGoalsForm";
import { UserRole } from "@/lib/types";
import { ADMIN_EMAILS } from "@/contexts/auth/utils";
import { COMMISSION_GOAL_AMOUNT } from "@/lib/constants";

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

      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      // Log all profiles for debugging
      console.log('All fetched profiles:', profiles);
      
      // Filter out admin users using role and ADMIN_EMAILS list
      const salespeople = profiles?.filter(profile => {
        const email = profile.email?.toLowerCase() || '';
        const role = profile.role?.toLowerCase() || '';
        
        // Not an admin if not in ADMIN_EMAILS and not explicitly 'admin' role
        return !ADMIN_EMAILS.includes(email) && role !== 'admin';
      });
      
      console.log('Filtered salespeople:', salespeople);
      
      if (!salespeople || salespeople.length === 0) {
        console.log('No salesperson profiles found');
        setUsers([]);
        setLoading(false);
        return;
      }

      // Fetch all monthly goals for the current month/year
      const { data: goals, error: goalsError } = await supabase
        .from('monthly_goals')
        .select('*')
        .eq('month', currentMonth)
        .eq('year', currentYear);

      if (goalsError) {
        console.error('Error fetching goals:', goalsError);
        throw goalsError;
      }

      console.log('Fetched goals:', goals);

      // Merge the data
      const usersWithGoals = salespeople.map(user => {
        const userGoal = goals?.find(g => g.user_id === user.id);
        return {
          ...user,
          goal_amount: userGoal?.goal_amount || undefined
        };
      });

      console.log('Users with goals:', usersWithGoals);
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
              {users.length > 0 ? (
                users.map((user) => (
                  <div key={user.id} className="flex flex-col p-3 border rounded-md hover:bg-accent/10 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                      <Button size="sm" onClick={() => handleEditClick(user)}>
                        Editar
                      </Button>
                    </div>
                    <div className="flex flex-col sm:flex-row text-sm gap-y-1 gap-x-4 mt-1">
                      <div className="flex gap-2 items-center">
                        <span className="text-muted-foreground">→ Meta Pessoal:</span>
                        <span className="font-medium">
                          {user.goal_amount ? `R$ ${user.goal_amount.toLocaleString('pt-BR')}` : 'Não definida'}
                        </span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <span className="text-muted-foreground">→ Meta Comissão:</span>
                        <span className="font-medium">R$ {COMMISSION_GOAL_AMOUNT.toLocaleString('pt-BR')}</span>
                        <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">Fixa</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
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
