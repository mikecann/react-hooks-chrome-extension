import { useRef, useEffect } from "react";

export function useDisposables() {
  const disposables = useRef<Function[]>([]);
  useEffect(() => () => disposables.current.forEach(d => d()), []);
  return (d: Function) => disposables.current.push(d);
}
