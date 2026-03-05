import type { FiberWip } from "../fiber/types";

export type CommitOp =
  | { type: "append"; parent: Node; node: Node }
  | { type: "remove"; node: Node }
  | { type: "updateText"; node: Text; text: string }
  // Первый рендер - только placement
  | { type: "placement"; fiber: FiberWip; parentFiber: FiberWip | null };
