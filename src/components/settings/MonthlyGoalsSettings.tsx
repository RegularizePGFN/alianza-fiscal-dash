
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ADMIN_EMAILS } from "@/contexts/auth/utils";
import { COMMISSION_GOAL_AMOUNT, CONTRACT_TYPE_PJ, CONTRACT_TYPE_CLT } from "@/lib/constants";

interface UserWithGoal {
  id: string;
  name: string;
  email: string;
  role: string;
  goal_amount?: number;
  contract_type?: string;
}

export function MonthlyGoalsSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserWithGoal[]>([]);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  
  // Form states
  const [goalAmount, setGoalAmount] = useState("");
  const [contractType, setContractType] = useState(CONTRACT_TYPE_PJ);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkGoalAmount, setBulkGoalAmount] = useState("");
  
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;
      
      const salespeople = profiles?.filter(profile => {
        const email = profile.email?.toLowerCase() || '';
        const role = profile.role?.toLowerCase() || '';
        const isAdmin = ADMIN_EMAILS.includes(email) || role === 'admin';
        const isSalesperson = role === 'vendedor' || role === 'salesperson';
        return !isAdmin && isSalesperson;
      });
      
      if (!salespeople || salespeople.length === 0) {
        setUsers([]);
        setLoading(false);
        return;
      }

      const { data: goals, error: goalsError } = await supabase
        .from('monthly_goals')
        .select('*')
        .eq('month', currentMonth)
        .eq('year', currentYear);

      if (goalsError) throw goalsError;

      const usersWithGoals = salespeople.map(user => {
        const userGoal = goals?.find(g => g.user_id === user.id);
        return {
          ...user,
          goal_amount: userGoal?.goal_amount || undefined
        };
      });

      setUsers(usersWithGoals);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar usuários",
        description: error.message || "Não foi possível carregar os usuários.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user: UserWithGoal) => {
    if (editingUserId === user.id) {
      setEditingUserId(null);
      return;
    }
    setEditingUserId(user.id);
    setGoalAmount(user.goal_amount?.toString() || "");
    setContractType(user.contract_type || CONTRACT_TYPE_PJ);
  };

  const handleSaveIndividual = async (user: UserWithGoal) => {
    if (!goalAmount || isNaN(Number(goalAmount))) {
      toast({
        title: "Erro",
        description: "Por favor, insira um valor válido para a meta.",
        variant: "destructive",
      });
      return;
    }

    setSavingId(user.id);

    try {
      const { error: goalError } = await supabase
        .from('monthly_goals')
        .upsert({
          user_id: user.id,
          month: currentMonth,
          year: currentYear,
          goal_amount: Number(goalAmount),
        }, {
          onConflict: 'user_id,month,year'
        });

      if (goalError) throw goalError;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ contract_type: contractType })
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast({
        title: "Sucesso",
        description: `Meta atualizada para ${user.name}.`,
      });

      setEditingUserId(null);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar.",
        variant: "destructive",
      });
    } finally {
      setSavingId(null);
    }
  };

  const handleCheckboxChange = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUserIds(prev => [...prev, userId]);
    } else {
      setSelectedUserIds(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUserIds(users.map(u => u.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleBulkSave = async () => {
    if (!bulkGoalAmount || isNaN(Number(bulkGoalAmount))) {
      toast({
        title: "Erro",
        description: "Por favor, insira um valor válido para a meta.",
        variant: "destructive",
      });
      return;
    }

    if (selectedUserIds.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um vendedor.",
        variant: "destructive",
      });
      return;
    }

    setBulkSaving(true);

    try {
      const upsertData = selectedUserIds.map(userId => ({
        user_id: userId,
        month: currentMonth,
        year: currentYear,
        goal_amount: Number(bulkGoalAmount),
      }));

      const { error } = await supabase
        .from('monthly_goals')
        .upsert(upsertData, {
          onConflict: 'user_id,month,year'
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Meta atualizada para ${selectedUserIds.length} vendedor(es).`,
      });

      setShowBulkEdit(false);
      setSelectedUserIds([]);
      setBulkGoalAmount("");
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar.",
        variant: "destructive",
      });
    } finally {
      setBulkSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle>Metas Mensais dos Vendedores</CardTitle>
              <CardDescription>
                Defina as metas para {currentMonth}/{currentYear}. Selecione múltiplos para edição em massa.
              </CardDescription>
            </div>
            {selectedUserIds.length > 0 && (
              <Button 
                onClick={() => setShowBulkEdit(!showBulkEdit)}
                variant={showBulkEdit ? "secondary" : "default"}
              >
                {showBulkEdit ? "Cancelar" : `Editar ${selectedUserIds.length} selecionado(s)`}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Bulk Edit Form */}
          {showBulkEdit && selectedUserIds.length > 0 && (
            <div className="mb-4 p-4 border rounded-lg bg-accent/20">
              <h4 className="font-medium mb-3">
                Edição em Massa - {selectedUserIds.length} vendedor(es) selecionado(s)
              </h4>
              <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="bulkGoal">Meta para todos</Label>
                  <Input
                    id="bulkGoal"
                    type="number"
                    value={bulkGoalAmount}
                    onChange={(e) => setBulkGoalAmount(e.target.value)}
                    placeholder="Ex: 15000"
                  />
                </div>
                <Button onClick={handleBulkSave} disabled={bulkSaving}>
                  {bulkSaving ? "Salvando..." : "Aplicar para todos"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Selecionados: {users.filter(u => selectedUserIds.includes(u.id)).map(u => u.name).join(", ")}
              </p>
            </div>
          )}

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center p-2 border rounded-md">
                  <div className="flex-1">
                    <Skeleton className="h-5 w-40 mb-1" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <Skeleton className="h-9 w-16" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {/* Select All */}
              {users.length > 0 && (
                <div className="flex items-center gap-2 pb-2 border-b mb-3">
                  <Checkbox
                    id="selectAll"
                    checked={selectedUserIds.length === users.length && users.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label htmlFor="selectAll" className="text-sm cursor-pointer">
                    Selecionar todos
                  </Label>
                </div>
              )}

              {users.length > 0 ? (
                users.map((user) => (
                  <div key={user.id} className="border rounded-md hover:bg-accent/10 transition-colors">
                    <div className="flex items-start gap-3 p-3">
                      <Checkbox
                        checked={selectedUserIds.includes(user.id)}
                        onCheckedChange={(checked) => handleCheckboxChange(user.id, !!checked)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                          <Button 
                            size="sm" 
                            variant={editingUserId === user.id ? "secondary" : "outline"}
                            onClick={() => handleEditClick(user)}
                          >
                            {editingUserId === user.id ? "Cancelar" : "Editar"}
                          </Button>
                        </div>
                        <div className="flex flex-col sm:flex-row text-sm gap-y-1 gap-x-4 mt-2">
                          <div className="flex gap-2 items-center">
                            <span className="text-muted-foreground">→ Meta Pessoal:</span>
                            <span className="font-medium">
                              {user.goal_amount ? `R$ ${user.goal_amount.toLocaleString('pt-BR')}` : 'Não definida'}
                            </span>
                          </div>
                          <div className="flex gap-2 items-center">
                            <span className="text-muted-foreground">→ Meta Comissão:</span>
                            <span className="font-medium">R$ {COMMISSION_GOAL_AMOUNT.toLocaleString('pt-BR')}</span>
                            <span className="text-xs bg-muted px-1.5 py-0.5 rounded">Fixa</span>
                          </div>
                        </div>

                        {/* Inline Edit Form */}
                        {editingUserId === user.id && (
                          <div className="mt-3 pt-3 border-t space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label htmlFor={`goal-${user.id}`}>Meta para {currentMonth}/{currentYear}</Label>
                                <Input
                                  id={`goal-${user.id}`}
                                  type="number"
                                  value={goalAmount}
                                  onChange={(e) => setGoalAmount(e.target.value)}
                                  placeholder="Ex: 15000"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor={`contract-${user.id}`}>Modelo de Contrato</Label>
                                <Select value={contractType} onValueChange={setContractType}>
                                  <SelectTrigger id={`contract-${user.id}`}>
                                    <SelectValue placeholder="Selecione" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={CONTRACT_TYPE_PJ}>
                                      PJ (20% até R$10k, 25% acima)
                                    </SelectItem>
                                    <SelectItem value={CONTRACT_TYPE_CLT}>
                                      CLT (5% até R$10k, 10% acima)
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="flex justify-end">
                              <Button 
                                size="sm" 
                                onClick={() => handleSaveIndividual(user)}
                                disabled={savingId === user.id}
                              >
                                {savingId === user.id ? "Salvando..." : "Salvar"}
                              </Button>
                            </div>
                          </div>
                        )}
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
    </div>
  );
}
