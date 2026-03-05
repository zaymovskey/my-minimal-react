import type { FiberNode, FiberWip } from "../fiber/types";
import type { CommitOp } from "../commitPhase.ts/types";

type HasFiberLinks<TSelf> = {
  parent: TSelf | null;
  kind: "host" | "text" | "fc";
};

export function buildCommitOps(
  oldfiber: FiberNode | null, // null при первом рендере
  newfiber: FiberWip,
  ops: CommitOp[],
): CommitOp[] {
  if (oldfiber === null) {
    // Первый рендер
    collectPlacements(newfiber, ops);
    return ops;
  }
  // Ререндер

  // text-text
  if (oldfiber.kind === "text" && newfiber.kind === "text") {
    // Изменился
    if (oldfiber.vnode.value !== newfiber.vnode.value) {
      ops.push({
        type: "updateText",
        node: oldfiber.stateNode,
        text: newfiber.vnode.value,
      });
    }
  }

  // host-host
  if (oldfiber.kind === "host" && newfiber.kind === "host") {
    // Изменился tag
    if (oldfiber.vnode.tag !== newfiber.vnode.tag) {
      ops.push({
        type: "remove",
        node: oldfiber.stateNode,
      });
      ops.push({
        type: "placement",
        fiber: newfiber,
        parentFiber: findHostParentFiber<FiberWip>(newfiber),
      });

      if (newfiber.child) {
        collectPlacements(newfiber.child, ops);
      }
      return ops;
    }

    if (oldfiber.vnode.tag === newfiber.vnode.tag) {
      // Обновляем пропсы
      ops.push({
        type: "updateProps",
        node: oldfiber.stateNode,
        prev: oldfiber.vnode.props,
        next: newfiber.vnode.props,
      });
    }
  }

  return ops;
}

function collectPlacements(fiber: FiberWip, ops: CommitOp[]) {
  const parentFiber = findHostParentFiber(fiber);

  if (fiber.kind === "host" || fiber.kind === "text") {
    ops.push({ type: "placement", fiber, parentFiber });
  }

  // Продолжаем обход родственников
  if (fiber.child) collectPlacements(fiber.child, ops);
  if (fiber.sibling) collectPlacements(fiber.sibling, ops);
}

export function findHostParentFiber<T extends HasFiberLinks<T>>(
  fiber: T,
): Extract<T, { kind: "host" }> | null {
  let p = fiber.parent;
  while (p) {
    if (p.kind === "host") return p as Extract<T, { kind: "host" }>;
    p = p.parent;
  }
  return null;
}
