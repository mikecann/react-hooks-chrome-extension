import { useState, useRef, useEffect } from "react";

import { usePorts, Port } from "./usePorts";
import { messagingServiceFactory } from "../messaging";
import { useDisposables } from "./useDisposables";

export function useSyncedStateFromBackground<State>(
  initialState: State,
  logger = console.log
): [State, React.Dispatch<React.SetStateAction<State>>] {
  // The app state
  const [state, updateState] = useState<State>(initialState);

  // Must dispose of listeners when we close
  const dispose = useDisposables();

  // To prevent circular updates
  const justUpdatedPort = useRef<Port | undefined>(undefined);

  // Typesafe messaging library
  const { current: messaging } = useRef(messagingServiceFactory<State>());

  // Listen for ports connecting
  const { ports, lastConnected } = usePorts(logger);

  // Only run this once a port connnects
  useEffect(
    () => {
      if (!lastConnected) return;

      logger("callback detected a port just connected", ports.length);

      const disposable = messaging.listenForMessage(lastConnected, "state-update", msg => {
        logger("updating state..");
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
      for (const p of ports)
        if (p != justUpdatedPort.current && !p.isDisconnected) messaging.updateState(p, state);
      justUpdatedPort.current = undefined;
    },
    [state]
  );

  return [state, updateState];
}
