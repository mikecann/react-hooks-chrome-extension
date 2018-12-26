const chrome = {
  runtime: {
    onConnect: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    }
  }
};

global["chrome"] = chrome;

import * as React from "react";
import { render } from "react-testing-library";
import { resetPortId } from "./usePorts";
import { useSyncedStateFromBackground } from "./useSyncedStateFromBackground";
import { portFactory } from "../../test/utils";

let hook: ReturnType<typeof useSyncedStateFromBackground> | undefined;
const initialState = { a: "foo" };

function SomeComponent() {
  hook = useSyncedStateFromBackground(initialState, jest.fn());
  return <div>hello</div>;
}

beforeEach(() => {
  hook = undefined;
  jest.clearAllMocks();
  resetPortId();
});

it("should initialize to the expected values", () => {
  const { rerender } = render(<SomeComponent />);
  rerender(<SomeComponent />);
  expect(hook![0]).toEqual({ a: "foo" });
});

it("should be able to have its state updated", () => {
  const { rerender } = render(<SomeComponent />);
  rerender(<SomeComponent />);
  hook![1]({ a: "bar" });
  expect(hook![0]).toEqual({ a: "bar" });
});

it("should update its state when a port sends a state update message", () => {
  const { rerender } = render(<SomeComponent />);
  rerender(<SomeComponent />);
  const port = portFactory();
  chrome.runtime.onConnect.addListener.mock.calls[0][0](port);
  rerender(<SomeComponent />);
  port.onMessage.addListener.mock.calls[0][0]({ type: "state-update", payload: { a: "derp" } });
  rerender(<SomeComponent />);
  expect(hook![0]).toEqual({ a: "derp" });
});

it("should send the initial state when a port connects", () => {
  const { rerender } = render(<SomeComponent />);
  rerender(<SomeComponent />);
  const port = portFactory();
  chrome.runtime.onConnect.addListener.mock.calls[0][0](port);
  rerender(<SomeComponent />);
  expect(port.postMessage.mock.calls).toEqual([[{ type: "state-update", payload: { a: "foo" } }]]);
});

it("should update the other ports when the state is changed locally", () => {
  const { rerender } = render(<SomeComponent />);
  rerender(<SomeComponent />);
  const portA = portFactory();
  const portB = portFactory();
  chrome.runtime.onConnect.addListener.mock.calls[0][0](portA);
  chrome.runtime.onConnect.addListener.mock.calls[0][0](portB);
  hook![1]({ a: "bar" });
  rerender(<SomeComponent />);
  expect(portA.postMessage.mock.calls).toEqual([
    [{ type: "state-update", payload: { a: "foo" } }],
    [{ type: "state-update", payload: { a: "bar" } }]
  ]);
  expect(portB.postMessage.mock.calls).toEqual([
    [{ type: "state-update", payload: { a: "foo" } }],
    [{ type: "state-update", payload: { a: "bar" } }]
  ]);
});

it("should prevent circular updates", () => {
  const { rerender } = render(<SomeComponent />);
  rerender(<SomeComponent />);
  const portA = portFactory();
  const portB = portFactory();
  chrome.runtime.onConnect.addListener.mock.calls[0][0](portA);
  chrome.runtime.onConnect.addListener.mock.calls[0][0](portB);
  rerender(<SomeComponent />);
  portA.onMessage.addListener.mock.calls[0][0]({ type: "state-update", payload: { a: "derp" } });
  rerender(<SomeComponent />);
  expect(portA.postMessage.mock.calls).toEqual([[{ type: "state-update", payload: { a: "foo" } }]]);
  expect(portB.postMessage.mock.calls).toEqual([
    [{ type: "state-update", payload: { a: "foo" } }],
    [{ type: "state-update", payload: { a: "derp" } }]
  ]);
});

it("should stop listening to all ports when unmounted", () => {
  const { unmount, rerender } = render(<SomeComponent />);
  rerender(<SomeComponent />);
  const portA = portFactory();
  const portB = portFactory();
  chrome.runtime.onConnect.addListener.mock.calls[0][0](portA);
  chrome.runtime.onConnect.addListener.mock.calls[0][0](portB);
  rerender(<SomeComponent />);
  expect(portA.onMessage.removeListener.mock.calls.length).toBe(0);
  expect(portB.onMessage.removeListener.mock.calls.length).toBe(0);
  unmount();
  expect(portA.onMessage.removeListener.mock.calls.length).toBe(1);
  expect(portA.onMessage.removeListener.mock.calls[0][0]).toBe(
    portA.onMessage.addListener.mock.calls[0][0]
  );
  expect(portB.onMessage.removeListener.mock.calls.length).toBe(1);
  expect(portB.onMessage.removeListener.mock.calls[0][0]).toBe(
    portB.onMessage.addListener.mock.calls[0][0]
  );
});
