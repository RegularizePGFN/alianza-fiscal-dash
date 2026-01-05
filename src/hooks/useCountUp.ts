
import { useState, useEffect, useRef } from 'react';

interface UseCountUpOptions {
  duration?: number;
  start?: number;
  decimals?: number;
  enabled?: boolean;
}

export function useCountUp(
  end: number,
  options: UseCountUpOptions = {}
) {
  const { duration = 1000, start = 0, decimals = 0, enabled = true } = options;
  const [count, setCount] = useState(enabled ? start : end);
  const countRef = useRef(start);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      setCount(end);
      return;
    }

    const startValue = countRef.current;
    const difference = end - startValue;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const currentValue = startValue + difference * easeOut;
      countRef.current = currentValue;
      setCount(Number(currentValue.toFixed(decimals)));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    startTimeRef.current = null;
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [end, duration, decimals, enabled]);

  return count;
}

export function useCountUpCurrency(value: number, enabled = true) {
  const count = useCountUp(value, { duration: 1200, decimals: 2, enabled });
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(count);
}

export function useCountUpPercentage(value: number, enabled = true) {
  const count = useCountUp(value * 100, { duration: 1000, decimals: 1, enabled });
  
  return `${count.toFixed(1)}%`;
}
