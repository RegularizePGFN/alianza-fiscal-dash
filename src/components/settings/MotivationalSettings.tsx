import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMotivationalSettings, useUpdateMotivationalSettings } from "@/hooks/useMotivationalSettings";
import { Trophy, Loader2, Save, Eye, Sparkles } from "lucide-react";

export function MotivationalSettings() {
  const { toast } = useToast();
  const { data: settings, isLoading, error } = useMotivationalSettings();
  const updateSettings = useUpdateMotivationalSettings();

  const [isActive, setIsActive] = useState(false);
  const [prizeTitle, setPrizeTitle] = useState("");
  const [prizeDescription, setPrizeDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [displayTopCount, setDisplayTopCount] = useState(5);

  useEffect(() => {
    if (settings) {
      setIsActive(settings.is_active);
      setPrizeTitle(settings.prize_title);
      setPrizeDescription(settings.prize_description || "");
      setStartDate(settings.start_date || "");
      setEndDate(settings.end_date || "");
      setDisplayTopCount(settings.display_top_count);
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync({
        is_active: isActive,
        prize_title: prizeTitle,
        prize_description: prizeDescription || null,
        start_date: startDate || null,
        end_date: endDate || null,
        display_top_count: displayTopCount,
      });
      toast({
        title: "Configurações salvas",
        description: "As configurações do motivacional foram atualizadas.",
      });
    } catch (err: any) {
      toast({
        title: "Erro ao salvar",
        description: err.message || "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (checked: boolean) => {
    setIsActive(checked);
    try {
      await updateSettings.mutateAsync({ is_active: checked });
      toast({
        title: checked ? "Motivacional ativado" : "Motivacional desativado",
        description: checked 
          ? "O ranking motivacional agora está visível para todos." 
          : "O ranking motivacional foi ocultado.",
      });
    } catch (err: any) {
      setIsActive(!checked);
      toast({
        title: "Erro",
        description: err.message || "Não foi possível alterar o status.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6">
          <p className="text-destructive">Erro ao carregar configurações do motivacional.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card className="dark:bg-gray-800/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Status do Motivacional</CardTitle>
                <CardDescription>Ative ou desative o ranking motivacional</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-green-600" : ""}>
                {isActive ? "Ativo" : "Inativo"}
              </Badge>
              <Switch
                checked={isActive}
                onCheckedChange={handleToggleActive}
                disabled={updateSettings.isPending}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Configuration Card */}
      <Card className="dark:bg-gray-800/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Configuração do Prêmio
          </CardTitle>
          <CardDescription>Configure o prêmio e detalhes do motivacional</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prize-title">Título do Prêmio</Label>
            <Input
              id="prize-title"
              value={prizeTitle}
              onChange={(e) => setPrizeTitle(e.target.value)}
              placeholder="Ex: Almoço na Churrascaria Tropeiro"
              className="dark:bg-gray-700/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prize-description">Descrição</Label>
            <Textarea
              id="prize-description"
              value={prizeDescription}
              onChange={(e) => setPrizeDescription(e.target.value)}
              placeholder="Ex: 2 ganhadores: quem fechar mais contratos + quem faturar mais!"
              className="dark:bg-gray-700/50"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="display-top">Exibir no Ranking</Label>
            <Select
              value={displayTopCount.toString()}
              onValueChange={(value) => setDisplayTopCount(parseInt(value))}
            >
              <SelectTrigger id="display-top" className="dark:bg-gray-700/50">
                <SelectValue placeholder="Selecione quantos exibir" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">Top 3</SelectItem>
                <SelectItem value="5">Top 5</SelectItem>
                <SelectItem value="10">Top 10</SelectItem>
                <SelectItem value="0">Mostrar todos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Data de Início (opcional)</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="dark:bg-gray-700/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">Data de Término (opcional)</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="dark:bg-gray-700/50"
              />
            </div>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={updateSettings.isPending}
            className="w-full md:w-auto"
          >
            {updateSettings.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Salvar Configurações
          </Button>
        </CardContent>
      </Card>

      {/* Preview Card */}
      <Card className="dark:bg-gray-800/50 border-dashed">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="h-5 w-5 text-muted-foreground" />
            Preview (como os vendedores verão)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                🎯 Prêmio da Semana
              </span>
            </div>
            <p className="text-lg font-bold">{prizeTitle || "Título do prêmio"}</p>
            {prizeDescription && (
              <p className="text-sm text-muted-foreground mt-1">{prizeDescription}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
