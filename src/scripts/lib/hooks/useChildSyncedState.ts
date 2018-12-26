import { useState, useEffect, useRef } from "react";
import { messagingServiceFactory } from "../messaging";

let id = 0;

export function useChildSyncedState<State>(pageName: string, initialState: State) {
  const [state, update] = useState<State>(initialState);
  const [port] = useState(() => chrome.runtime.connect({ name: pageName + id++ }));

  // Typesafe messaging library
  const { current: messaging } = useRef(messagingServiceFactory<State>());

  useEffect(() => {
    const dispose = messaging.listenForMessage(port, "state-update", msg => update(msg.payload));
    return () => {
      dispose();
      port.disconnect();
    };
  }, []);

  return {
    state,
    update: (s: Partial<State>) => {
      const newState: State = { ...state, ...s };
      messaging.updateState(port, newState);
      update(newState);
    }
  };
}
