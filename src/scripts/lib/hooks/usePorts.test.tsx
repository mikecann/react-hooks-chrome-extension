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
import { usePorts, resetPortId } from "./usePorts";
import { portFactory } from "../../test/utils";

let state: ReturnType<typeof usePorts> | undefined;

function SomeComponent() {
  state = usePorts(jest.fn());
  return <div>hello</div>;
}

beforeEach(() => {
  state = undefined;
  jest.clearAllMocks();
  resetPortId();
});

it("should initialize to the expected values", () => {
  const { rerender } = render(<SomeComponent />);
  rerender(<SomeComponent />);
  expect(state).toEqual({ ports: [], lastConnected: undefined, lastDisconnected: undefined });
});

it("should add a port when one connects", () => {
  const { rerender } = render(<SomeComponent />);
  rerender(<SomeComponent />);
  const port = portFactory();
  chrome.runtime.onConnect.addListener.mock.calls[0][0](port);
  expect(state).toEqual({ ports: [port], lastConnected: port, lastDisconnected: undefined });
  expect(state!.ports[0].id).toEqual(0);
});

it("should add another port when it connects", () => {
  const { rerender } = render(<SomeComponent />);
  rerender(<SomeComponent />);
  const portA = portFactory();
  const portB = portFactory();
  chrome.runtime.onConnect.addListener.mock.calls[0][0](portA);
  chrome.runtime.onConnect.addListener.mock.calls[0][0](portB);
  expect(state).toEqual({
    ports: [portA, portB],
    lastConnected: portB,
    lastDisconnected: undefined
  });
  expect(state!.ports[0].id).toEqual(0);
  expect(state!.ports[1].id).toEqual(1);
});

it("should remove a port when it disconnects", () => {
  const { rerender } = render(<SomeComponent />);
  rerender(<SomeComponent />);
  const portA = portFactory();
  const portB = portFactory();
  chrome.runtime.onConnect.addListener.mock.calls[0][0](portA);
  chrome.runtime.onConnect.addListener.mock.calls[0][0](portB);
  portA.onDisconnect.addListener.mock.calls[0][0](portA);
  expect(state).toEqual({
    ports: [portB],
    lastConnected: portB,
    lastDisconnected: portA
  });
  expect(state!.ports[0].id).toEqual(1);
});

it("should stop listening to runtime when unmounted", () => {
  const { unmount, rerender } = render(<SomeComponent />);
  rerender(<SomeComponent />);
  unmount();
  expect(chrome.runtime.onConnect.removeListener.mock.calls.length).toBe(1);
});

it("should stop listening to port disconnects when unmounted", () => {
  const { unmount, rerender } = render(<SomeComponent />);
  rerender(<SomeComponent />);
  const port = portFactory();
  chrome.runtime.onConnect.addListener.mock.calls[0][0](port);
  expect(state).toEqual({ ports: [port], lastConnected: port, lastDisconnected: undefined });
  expect(state!.ports[0].id).toEqual(0);
  expect(port.onDisconnect.removeListener.mock.calls.length).toBe(0);
  unmount();
  expect(port.onDisconnect.removeListener.mock.calls.length).toBe(1);
  expect(port.onDisconnect.removeListener.mock.calls[0][0]).toBe(
    port.onDisconnect.addListener.mock.calls[0][0]
  );
});
