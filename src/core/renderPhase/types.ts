import type { HostOrTextWip, HostWip } from "../fiber/types";

export type CommitOp =
  | { type: "append"; parent: Node; node: Node }
  | {
      type: "placement";
      fiber: HostOrTextWip;
      parentFiber: HostWip | null;
    }
  | { type: "remove"; node: Node }
  | { type: "updateText"; node: Text; text: string }
  | {
      type: "updateProps";
      node: HTMLElement;
      prev: Record<string, any>;
      next: Record<string, any>;
    };
