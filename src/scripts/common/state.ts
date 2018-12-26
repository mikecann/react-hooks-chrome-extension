import { useBackgroundSyncedState } from "../lib/hooks/useBackgroundSyncedState";
import { useChildSyncedState } from "../lib/hooks/useChildSyncedState";

export type ExtensionState = {
  count: number;
  msg: string;
};

const initialState: ExtensionState = { count: 0, msg: "foo" };

export const useBackgroundState = () => useBackgroundSyncedState<ExtensionState>(initialState);

export const useChildState = (name: string) =>
  useChildSyncedState<ExtensionState>(name, initialState);
