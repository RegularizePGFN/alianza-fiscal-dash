
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface AdditionalCommentsFieldProps {
  value: string;
  onChange: (value: string) => void;
}

const AdditionalCommentsField = ({ value, onChange }: AdditionalCommentsFieldProps) => {
  return (
    <Card className="mb-4 border-2 border-blue-400 shadow-md">
      <CardHeader className="pb-2 bg-blue-50">
        <CardTitle className="text-sm font-medium flex items-center">
          <FileText className="h-5 w-5 mr-2 text-blue-500" />
          Adicionar Observações
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Label htmlFor="additional-comments" className="sr-only">
          Observações adicionais
        </Label>
        <Textarea
          id="additional-comments"
          placeholder="Digite aqui quaisquer observações adicionais que deseja incluir na proposta..."
          className="min-h-[120px] resize-y"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
        <div className="mt-1 text-xs text-gray-500">
          Estas observações aparecerão no fim do documento PDF gerado.
        </div>
      </CardContent>
    </Card>
  );
};

export default AdditionalCommentsField;
