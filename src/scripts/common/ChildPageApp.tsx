import * as React from "react";
import { useState } from "react";
import { useSyncStateFromChild } from "./state";

function MiniChildPage(props: { index: number; onRemove: () => void; name: string }) {
  const [state, update] = useSyncStateFromChild(props.name);

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
export function ChildPageApp(props: { name: string }) {
  const [children, setChildren] = useState<number[]>([]);
  const removeChild = (indx: number) => setChildren(children.filter(c => c != indx));
  const addChild = () => setChildren([...children, childId++]);
  return (
    <div>
      {children.map(c => (
        <MiniChildPage key={c} name={props.name} index={c} onRemove={() => removeChild(c)} />
      ))}
      <button onClick={addChild}>Add Child</button>
    </div>
  );
}
