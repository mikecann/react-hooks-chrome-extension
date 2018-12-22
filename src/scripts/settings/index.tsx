import * as React from "react";
import * as ReactDOM from "react-dom";
import { useState } from "react";

console.log("hello from the settings page");

var port = chrome.runtime.connect({ name: "knockknock" });

port.postMessage({ joke: "Knock knock" });

port.onMessage.addListener(function(msg) {
  if (msg.question == "Who's there?") port.postMessage({ answer: "Madame" });
  else if (msg.question == "Madame who?") port.postMessage({ answer: "Madame... Bovary" });
});

function Example() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button
        onClick={() => {
          setCount(count + 1);
          port.postMessage({ joke: "Knock knock" });
        }}
      >
        Click me
      </button>
    </div>
  );
}

ReactDOM.render(
  <div>
    <p>Hello World</p>
    <Example />
  </div>,
  document.getElementById("root")
);
