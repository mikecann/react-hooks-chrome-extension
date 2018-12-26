import { portFactory } from "../../test/utils";

const port = portFactory();

const chrome = {
  runtime: {
    onConnect: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    },
    connect: jest.fn().mockReturnValue(port)
  }
};

global["chrome"] = chrome;

import * as React from "react";
import { render } from "react-testing-library";
import { usePorts, resetPortId } from "./usePorts";
import { useSyncedStateFromChildPage } from "./useSyncedStateFromChildPage";

let hook: ReturnType<typeof useSyncedStateFromChildPage> | undefined;

const initialState = {
  a: "foo"
};

function SomeComponent() {
  hook = useSyncedStateFromChildPage("zzz", initialState);
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

it("should be able to have its state partially updated", () => {
  const { rerender } = render(<SomeComponent />);
  rerender(<SomeComponent />);
  hook![1]({ a: "bar", b: "bee" });
  expect(hook![0]).toEqual({ a: "bar", b: "bee" });
  hook![1]({ b: "derp" });
  expect(hook![0]).toEqual({ a: "bar", b: "derp" });
});

it("should update its state when the port sends a state update message", () => {
  const { rerender } = render(<SomeComponent />);
  rerender(<SomeComponent />);
  port.onMessage.addListener.mock.calls[0][0]({ type: "state-update", payload: { a: "derp" } });
  rerender(<SomeComponent />);
  expect(hook![0]).toEqual({ a: "derp" });
});

it("should stop listening to the port when unmounted", () => {
  const { unmount, rerender } = render(<SomeComponent />);
  rerender(<SomeComponent />);
  expect(port.onMessage.removeListener.mock.calls.length).toBe(0);
  unmount();
  expect(port.onMessage.removeListener.mock.calls.length).toBe(1);
  expect(port.onMessage.removeListener.mock.calls[0][0]).toBe(
    port.onMessage.addListener.mock.calls[0][0]
  );
});

it("should disconnect the port when unmounted", () => {
  const { unmount, rerender } = render(<SomeComponent />);
  rerender(<SomeComponent />);
  expect(port.disconnect.mock.calls.length).toBe(0);
  unmount();
  expect(port.disconnect.mock.calls.length).toBe(1);
});
