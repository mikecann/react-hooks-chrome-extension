import { useSyncedStateFromBackground } from "../lib/hooks/useSyncedStateFromBackground";
import { useSyncedStateFromChildPage } from "../lib/hooks/useSyncedStateFromChildPage";

export type ExtensionState = {
  count: number;
  msg: string;
};

const initialState: ExtensionState = { count: 0, msg: "foo" };

export const useSyncStateFromBg = () => useSyncedStateFromBackground<ExtensionState>(initialState);

export const useSyncStateFromChild = (name: string) =>
  useSyncedStateFromChildPage<ExtensionState>(name, initialState);
