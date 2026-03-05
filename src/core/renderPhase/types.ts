import type { FiberWip } from "../fiber/types";

export type HostOrTextWip = Extract<FiberWip, { kind: "host" | "text" }>;
export type HostWip = Extract<FiberWip, { kind: "host" }>;

export type CommitOp =
  | { type: "append"; parent: Node; node: Node }
  | {
      type: "placement";
      fiber: HostOrTextWip;
      parentFiber: HostWip | null;
    }
  | { type: "remove"; node: Node }
  | { type: "updateText"; node: Text; text: string };
