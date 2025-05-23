
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function LoadingState() {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Dashboard de Propostas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </CardContent>
    </Card>
  );
}
