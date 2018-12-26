import { useEffect, useState } from "react";

export function useInterval(options: { intervalMs: number; callback?: () => void }) {
  useEffect(() => {
    const interval = setInterval(() => {
      options.callback && options.callback();
    }, options.intervalMs);
    return () => clearInterval(interval);
  }, []);
}
