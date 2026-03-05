import type { FiberNode, FiberWip } from "../fiber/types";
import type { CommitOp } from "./types";

export function buildCommitOps(
  oldfiber: FiberNode | null, // null при первом рендере
  newfiber: FiberWip,
  ops: CommitOp[],
): CommitOp[] {
  if (oldfiber === null) {
    collectPlacements(newfiber, ops);
    return ops;
  }

  return ops;
}

function collectPlacements(fiber: FiberWip, ops: CommitOp[]) {
  const parentFiber = findHostParentFiber(fiber);

  if (fiber.kind === "host" || fiber.kind === "text") {
    ops.push({ type: "placement", fiber, parentFiber });
  }

  if (fiber.kind === "fc") {
    if (fiber.child) collectPlacements(fiber.child, ops);
    if (fiber.sibling) collectPlacements(fiber.sibling, ops);

    return;
  }

  throw new Error("🛑 Unknown fiber kind");
}

function findHostParentFiber(fiber: FiberWip): FiberWip | null {
  let p = fiber.parent;
  while (p) {
    if (p.kind === "host") return p;
    p = p.parent;
  }
  return null;
}
