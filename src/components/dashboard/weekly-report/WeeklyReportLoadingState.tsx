
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function WeeklyReportLoadingState() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Consolidado por Semana</CardTitle>
      </CardHeader>
      <CardContent className="h-60 flex items-center justify-center">
        <p>Carregando dados...</p>
      </CardContent>
    </Card>
  );
}
