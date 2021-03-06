import { useState, useEffect, useRef } from "react";
import { useDisposables } from "./useDisposables";

export type Port = chrome.runtime.Port & {
  id: number;
  toString: () => string;
  isDisconnected: boolean | undefined;
};

let portId = 0;

export const resetPortId = () => (portId = 0);

type State = {
  ports: Port[];
  lastConnected?: Port | undefined;
  lastDisconnected?: Port | undefined;
};

export function usePorts(logger = console.log) {
  const [state, updateState] = useState<State>({
    ports: []
  });

  const dispose = useDisposables();

  function onPortConnected(port: Port) {
    port.id = portId++;
    port.toString = () => `[${port.id}] ${port.name}`;

    logger(`Port '${port}' connected`);

    function onPortDisconnect(port: Port) {
      logger(`Port '${port}' disconnected`);
      port.isDisconnected = true;

      updateState(prev => ({
        ...prev,
        ports: prev.ports.filter(p => p != port),
        lastDisconnected: port
      }));
    }

    port.onDisconnect.addListener(onPortDisconnect);
    dispose(() => port.onDisconnect.removeListener(onPortDisconnect));

    updateState(prev => ({ ...prev, ports: [...prev.ports, port], lastConnected: port }));
  }

  useEffect(() => {
    chrome.runtime.onConnect.addListener(onPortConnected);
    return () => {
      chrome.runtime.onConnect.removeListener(onPortConnected);
    };
  }, []);

  return state;
}
