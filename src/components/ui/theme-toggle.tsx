
import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");

  useEffect(() => {
    // Check for saved theme or use system preference
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
    
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, [prefersDark]);

  function applyTheme(newTheme: "light" | "dark") {
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  function toggleTheme() {
    const newTheme = theme === "light" ? "dark" : "light";
    localStorage.setItem("theme", newTheme);
    setTheme(newTheme);
    applyTheme(newTheme);
  }

  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={toggleTheme}
      className="rounded-full w-9 h-9 transition-all duration-300 hover:scale-110 bg-transparent border-gray-300 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800"
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5 transition-all duration-500 rotate-0" />
      ) : (
        <Sun className="h-5 w-5 transition-all duration-500 rotate-0" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
