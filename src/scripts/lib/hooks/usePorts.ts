import { useState, useEffect, useRef } from "react";
import { useDisposables } from "./useDisposables";

export type Port = chrome.runtime.Port & { id: number; toString: () => string };

let portId = 0;

type State = {
  ports: Port[];
  lastConnected?: Port | undefined;
  lastDisconnected?: Port | undefined;
};

export function usePorts() {
  const [state, updateState] = useState<State>({
    ports: []
  });

  const dispose = useDisposables();

  function onPortConnected(port: Port) {
    port.id = portId++;
    port.toString = () => `[${port.id}] ${port.name}`;

    console.log(`Port '${port}' connected`);

    updateState(prev => ({ ...prev, ports: [...prev.ports, port], lastConnected: port }));

    function onPortDisconnect(port: Port) {
      console.log(`Port '${port}' disconnected`);
      updateState(prev => ({
        ...prev,
        ports: prev.ports.filter(p => p != port),
        lastDisconnected: port
      }));
    }

    port.onDisconnect.addListener(onPortDisconnect);

    dispose(() => port.onDisconnect.removeListener(onPortDisconnect));
  }

  useEffect(() => {
    chrome.runtime.onConnect.addListener(onPortConnected);
    return () => {
      chrome.runtime.onConnect.removeListener(onPortConnected);
    };
  }, []);

  return state;
}
