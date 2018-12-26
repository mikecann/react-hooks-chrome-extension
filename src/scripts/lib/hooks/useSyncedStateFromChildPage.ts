import { useState, useEffect, useRef } from "react";
import { messagingServiceFactory } from "../messaging";

let id = 0;

export function useSyncedStateFromChildPage<State>(
  pageName: string,
  initialState: State
): [State, (state: Partial<State>) => void] {
  const [state, update] = useState<State>(initialState);
  const [port] = useState(() => chrome.runtime.connect({ name: pageName + id++ }));
  const { current: messaging } = useRef(messagingServiceFactory<State>());

  useEffect(() => {
    const dispose = messaging.listenForMessage(port, "state-update", msg => update(msg.payload));
    return () => {
      dispose();
      port.disconnect();
    };
  }, []);

  return [
    state,
    (s: Partial<State>) => {
      const newState: State = { ...state, ...s };
      messaging.updateState(port, newState);
      update(newState);
    }
  ];
}
