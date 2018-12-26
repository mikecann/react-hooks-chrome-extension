import { useState, useRef, useEffect, useCallback } from "react";

import { usePorts, Port } from "./usePorts";
import { messagingServiceFactory } from "../messaging";
import { useDisposables } from "./useDisposables";

export function useBackgroundSyncedState<T>(initialState: T) {
  // The app state
  const [state, updateState] = useState<T>(initialState);

  // Must dispose of listeners when we coose
  const dispose = useDisposables();

  // To prevent circular updates
  const justUpdatedPort = useRef<Port | undefined>(undefined);

  // Typesafe messaging library
  const { current: messaging } = useRef(messagingServiceFactory<T>());

  // Listen for ports connecting
  const { ports, lastConnected } = usePorts();

  // Only run this once a port connnects
  useEffect(
    () => {
      if (!lastConnected) return;

      console.log("callback detected a port just connected", ports.length);

      const disposable = messaging.listenForMessage(lastConnected, "state-update", msg => {
        console.log("updating state..");
        justUpdatedPort.current = lastConnected;
        updateState(msg.payload);
      });

      dispose(disposable);

      messaging.updateState(lastConnected, state);
    },
    [lastConnected]
  );

  // Run this if the state changes
  useEffect(
    () => {
      for (const p of ports) if (p != justUpdatedPort.current) messaging.updateState(p, state);
      justUpdatedPort.current = undefined;
    },
    [state]
  );

  return [state, updateState];
}
