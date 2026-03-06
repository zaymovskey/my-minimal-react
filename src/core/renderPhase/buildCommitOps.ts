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
    // ----------------
    // Первый рендер   |
    // ----------------
    collectPlacements(newfiber, ops);
    return ops;
  }

  // ----------------
  // Ререндер        |
  // ----------------

  // 1 text-text
  if (oldfiber.kind === "text" && newfiber.kind === "text") {
    // 1.1 Изменился текст
    if (oldfiber.vnode.value !== newfiber.vnode.value) {
      ops.push({
        type: "updateText",
        node: oldfiber.stateNode,
        text: newfiber.vnode.value,
      });
    }
  }

  // 2 host-host
  if (oldfiber.kind === "host" && newfiber.kind === "host") {
    // 2.1 Изменился tag
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
      // 2.2 Обновляем пропсы
      ops.push({
        type: "updateProps",
        node: oldfiber.stateNode,
        prev: oldfiber.vnode.props,
        next: newfiber.vnode.props,
      });
    }

    // 2.3 children reconcile
    const oldChildren = collectChildren(oldfiber);
    const newChildren = collectChildren(newfiber);

    const isKeyed = oldChildren.some((c) => c.vnode.key != null);
    const isAllKeyed = oldChildren.every((c) => c.vnode.key != null);

    if (isKeyed && !isAllKeyed) {
      throw new Error("🛑 Mixed keyed and unkeyed children are not supported");
    }

    if (!isKeyed) {
      // 2.3.1 Unkeyed - по индексу
      const maxLen = Math.max(oldChildren.length, newChildren.length);
      for (let i = 0; i < maxLen; i++) {
        const oldChild = oldChildren[i] ?? null;
        const newChild = newChildren[i] ?? null;

        if (oldChild && newChild) {
          buildCommitOps(oldChild, newChild, ops);
        } else if (!oldChild && newChild) {
          collectPlacements(newChild, ops);
        } else if (oldChild && !newChild) {
          collectRemovals(oldChild, ops);
        }
      }
    } else {
    }
  }

  return ops;
}

function collectRemovals(fiber: FiberNode, ops: CommitOp[]) {
  if (fiber.kind === "host" || fiber.kind === "text") {
    ops.push({
      type: "remove",
      node: fiber.stateNode,
    });
  }

  if (fiber.child) {
    collectRemovals(fiber.child, ops);
  }

  if (fiber.sibling) {
    collectRemovals(fiber.sibling, ops);
  }
}

function collectChildren<T extends FiberWip | FiberNode>(
  fiber: T,
  out: T[] = [],
): T[] {
  let child = fiber.child;

  while (child) {
    out.push(child as T);
    child = child.sibling;
  }

  return out;
}

function collectPlacements(fiber: FiberWip | FiberNode, ops: CommitOp[]) {
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
