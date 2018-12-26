import * as React from "react";
import * as ReactDOM from "react-dom";
import { useSyncStateFromBg } from "../common/state";
import { useInterval } from "../lib/hooks/useInterval";

function App() {
  const [state, updateState] = useSyncStateFromBg();

  useInterval({
    intervalMs: 1000,
    callback: () => updateState(prev => ({ ...prev, count: prev.count + 1 }))
  });

  console.log("APP RENDER", state);
  return <></>;
}

console.log("hello from the background page");

ReactDOM.render(<App />, document.getElementById("root"));
