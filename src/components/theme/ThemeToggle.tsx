
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "@/hooks/use-theme";

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full h-9 w-9 lg:h-10 lg:w-10"
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-yellow-300 transition-transform rotate-0 scale-100" />
            ) : (
              <Moon className="h-5 w-5 text-slate-700 transition-transform rotate-90 scale-100" />
            )}
            <span className="sr-only">Alternar tema</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Alternar para tema {isDark ? "claro" : "escuro"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
