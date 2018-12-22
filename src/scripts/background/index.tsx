import * as React from "react";
import * as ReactDOM from "react-dom";
import { useState, useEffect } from "react";

type State = {
  count: number;
  msg: string;
};

function App() {
  const [ports, updatePorts] = useState<chrome.runtime.Port[]>([]);
  const [state, updateState] = useState<State>({ count: 0, msg: "background" });

  console.log("APP RENDER", ports, state);

  function onPortConnected(port: chrome.runtime.Port) {
    console.log("Port connected", port.name, ports);

    updatePorts([...ports, port]);
    updateState({ ...state, count: state.count + 1 });

    port.onMessage.addListener(msg => {
      console.log("Message from port", msg);
    });

    port.onDisconnect.addListener(disconnectedPort => {
      updatePorts(ports.filter(p => p != port));
      console.log("Port disconnected", disconnectedPort.name);
    });
  }

  useEffect(() => {
    chrome.runtime.onConnect.addListener(onPortConnected);
    return () => chrome.runtime.onConnect.removeListener(onPortConnected);
  });

  console.log("Background page updated", { ports, state });

  return <div />;
}

console.log("hello from the background page");

ReactDOM.render(<App />, document.getElementById("root"));
