import { useState, useEffect, useRef } from "react";
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
import { Trophy, Loader2, Save, Eye, Sparkles, Upload, Trash2, ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function MotivationalSettings() {
  const { toast } = useToast();
  const { data: settings, isLoading, error } = useMotivationalSettings();
  const updateSettings = useUpdateMotivationalSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isActive, setIsActive] = useState(false);
  const [prizeTitle, setPrizeTitle] = useState("");
  const [prizeDescription, setPrizeDescription] = useState("");
  const [prizeImageUrl, setPrizeImageUrl] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [displayTopCount, setDisplayTopCount] = useState(5);
  const [rankingType, setRankingType] = useState<'volume' | 'amount' | 'both'>('both');
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (settings) {
      setIsActive(settings.is_active);
      setPrizeTitle(settings.prize_title);
      setPrizeDescription(settings.prize_description || "");
      setPrizeImageUrl(settings.prize_image_url);
      setStartDate(settings.start_date || "");
      setEndDate(settings.end_date || "");
      setDisplayTopCount(settings.display_top_count);
      setRankingType(settings.ranking_type || 'both');
    }
  }, [settings]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione uma imagem.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 2MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadingImage(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `prize-banner-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("motivational")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("motivational")
        .getPublicUrl(fileName);

      const newImageUrl = urlData.publicUrl;
      setPrizeImageUrl(newImageUrl);

      // Save to database
      await updateSettings.mutateAsync({ prize_image_url: newImageUrl });

      toast({
        title: "Imagem enviada",
        description: "A imagem do prêmio foi atualizada.",
      });
    } catch (err: any) {
      toast({
        title: "Erro ao enviar imagem",
        description: err.message || "Não foi possível enviar a imagem.",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = async () => {
    try {
      setPrizeImageUrl(null);
      await updateSettings.mutateAsync({ prize_image_url: null });
      toast({
        title: "Imagem removida",
        description: "A imagem do prêmio foi removida.",
      });
    } catch (err: any) {
      toast({
        title: "Erro ao remover imagem",
        description: err.message || "Não foi possível remover a imagem.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync({
        is_active: isActive,
        prize_title: prizeTitle,
        prize_description: prizeDescription || null,
        start_date: startDate || null,
        end_date: endDate || null,
        display_top_count: displayTopCount,
        ranking_type: rankingType,
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
          {/* Image Upload Section */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Imagem do Prêmio (opcional)
            </Label>
            <p className="text-xs text-muted-foreground">
              Dimensões recomendadas: 800 x 200 pixels (proporção 4:1)
            </p>
            
            {prizeImageUrl ? (
              <div className="space-y-2">
                <div className="relative rounded-lg overflow-hidden border border-border">
                  <img 
                    src={prizeImageUrl} 
                    alt="Preview do prêmio" 
                    className="w-full h-auto object-cover"
                    style={{ maxHeight: "150px" }}
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRemoveImage}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remover Imagem
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {uploadingImage ? "Enviando..." : "Escolher Imagem"}
                </Button>
              </div>
            )}
          </div>

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
            <Label htmlFor="ranking-type">Tipo de Ranking</Label>
            <Select
              value={rankingType}
              onValueChange={(value) => setRankingType(value as 'volume' | 'amount' | 'both')}
            >
              <SelectTrigger id="ranking-type" className="dark:bg-gray-700/50">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="volume">Apenas Volume de Contratos (1 ganhador)</SelectItem>
                <SelectItem value="amount">Apenas Faturamento (1 ganhador)</SelectItem>
                <SelectItem value="both">Ambos (2 ganhadores)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {rankingType === 'volume' && "Ganhador: quem fechar mais contratos na semana"}
              {rankingType === 'amount' && "Ganhador: quem faturar mais na semana"}
              {rankingType === 'both' && "2 ganhadores: quem fechar mais contratos + quem faturar mais"}
            </p>
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
          {/* Preview Image */}
          {prizeImageUrl && (
            <div className="rounded-lg overflow-hidden mb-3">
              <img 
                src={prizeImageUrl} 
                alt="Preview do prêmio" 
                className="w-full h-auto object-cover"
                style={{ maxHeight: "150px" }}
              />
            </div>
          )}
          
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