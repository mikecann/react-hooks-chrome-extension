import * as React from "react";
import * as ReactDOM from "react-dom";
import { useState, useEffect } from "react";

console.log("hello from the page..");

function Child(props: { index: number; onRemove: () => void }) {
  const { state, update } = useExtensionState("useExtensionState-" + props.index);

  return (
    <div>
      <p>
        [{props.index}] clicked {state.count} times
      </p>
      <button
        onClick={() => {
          update({ count: state.count + 1 });
        }}
      >
        Increment
      </button>
      <button onClick={props.onRemove}>Delete</button>
    </div>
  );
}

let childId = 0;
function App() {
  const [children, setChildren] = useState<number[]>([]);
  const removeChild = (indx: number) => setChildren(children.filter(c => c != indx));
  const addChild = () => setChildren([...children, childId++]);
  return (
    <div>
      {children.map(c => (
        <Child key={c} index={c} onRemove={() => removeChild(c)} />
      ))}
      <button onClick={addChild}>Add Child</button>
    </div>
  );
}

type State = {
  count: number;
  msg: string;
};

function useExtensionState(portName: string) {
  const [state, update] = useState<State>({ count: 0, msg: "foo" });
  const [port] = useState(() => chrome.runtime.connect({ name: portName }));

  useEffect(() => {
    return () => {
      console.log("disconnecting port " + port.name);
      port.disconnect();
    };
  }, []);

  return {
    state,
    update: (s: Partial<State>) => {
      const newState: State = { ...state, ...s };
      update(newState);
      port.postMessage(newState);
    }
  };
}

ReactDOM.render(<App />, document.getElementById("root"));
