import { MessagesFromPayloads, messagingServiceFactory } from "../lib/messaging";
import { ExtensionState } from "./state";

type MessagePayloads = {
  "some-other-message": undefined;
  "some-other-message2": { prop: string };
};

type Messages = MessagesFromPayloads<MessagePayloads>;

export type SomeOtherMessage = Messages["some-other-message"];
export type SomeOtherMessage2 = Messages["some-other-message"];

export type ExtensionMessages = Messages[keyof Messages];

export const messaging = messagingServiceFactory<ExtensionState, MessagePayloads>();
