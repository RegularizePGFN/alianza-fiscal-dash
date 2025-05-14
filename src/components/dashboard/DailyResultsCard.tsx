
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sale } from "@/lib/types";
import { formatCurrency, getTodayISO } from "@/lib/utils";
import { ArrowDown, ArrowUp, CircleDollarSign, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DailyResultsCard as NewDailyResultsCard } from "./daily-results";

// This file is now just a wrapper for the new implementation
// This ensures backward compatibility while we transition to the new component structure
export function DailyResultsCard({ salesData }: { salesData: Sale[] }) {
  return <NewDailyResultsCard salesData={salesData} />;
}
