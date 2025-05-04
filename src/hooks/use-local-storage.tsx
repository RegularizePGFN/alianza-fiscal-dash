
import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Estado para armazenar o valor
  const [storedValue, setStoredValue] = useState<T>(() => {
    // Caso estejamos no lado do servidor, retornamos o valor inicial
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      // Obter valor do localStorage por chave
      const item = window.localStorage.getItem(key);
      // Analisar JSON armazenado ou retornar valor inicial
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Se houver erro, retornar valor inicial
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Função para atualizar localStorage e estado
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permite que o valor seja uma função para que tenhamos a mesma API que useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Salva estado
      setStoredValue(valueToStore);
      // Salva no localStorage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Sincroniza valores entre guias/janelas
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        setStoredValue(JSON.parse(e.newValue));
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key]);

  return [storedValue, setValue] as const;
}
