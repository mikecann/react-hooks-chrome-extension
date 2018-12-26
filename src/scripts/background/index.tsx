import * as React from "react";
import * as ReactDOM from "react-dom";
import { useBackgroundState, ExtensionState } from "../common/state";
import { useBackgroundSyncedState } from "../lib/hooks/useBackgroundSyncedState";

function App() {
  const [state, updateState] = useBackgroundState();
  console.log("APP RENDER", state);
  return <></>;
}

console.log("hello from the background page");

ReactDOM.render(<App />, document.getElementById("root"));
