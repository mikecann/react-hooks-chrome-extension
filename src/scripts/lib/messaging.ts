export type MessagesFromPayloads<T> = { [K in keyof T]: { type: string; payload: T[K] } };

export type LibMessagePayloads<TExtensionState> = {
  "state-update": TExtensionState;
};

export type LibMessages<TState> = MessagesFromPayloads<LibMessagePayloads<TState>>;

export const messagingServiceFactory = <State, UserMessagePayloads = {}>() => {
  type Payloads = LibMessagePayloads<State> & UserMessagePayloads;
  type Messages = LibMessages<State> & MessagesFromPayloads<UserMessagePayloads>;
  type Port = chrome.runtime.Port;

  const postMessage = <MessageType extends keyof Payloads>(
    port: Port,
    type: MessageType,
    payload: Payloads[MessageType]
  ) => port.postMessage({ type, payload });

  return {
    postMessage,

    updateState: (port: Port, payload: Payloads["state-update"]) =>
      postMessage(port, "state-update", payload),

    listenForMessage: <MessageType extends keyof Payloads>(
      port: Port,
      type: MessageType,
      listener: (msg: Messages[MessageType]) => void
    ) => {
      function onMessage(msg: any) {
        if (msg.type == type) listener(msg);
      }
      port.onMessage.addListener(onMessage);
      return () => port.onMessage.removeListener(onMessage);
    }
  };
};

export const messaging = messagingServiceFactory();
