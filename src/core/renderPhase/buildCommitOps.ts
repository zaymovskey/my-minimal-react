import type { FiberNode, FiberWip } from "../fiber/types";
import type { CommitOp } from "../commitPhase.ts/types";

type HasFiberLinks<TSelf> = {
  parent: TSelf | null;
  kind: "host" | "text" | "fc";
};

type KeyedOldChild = {
  fiber: FiberNode;
  oldIndex: number;
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

  // -------------
  // 1. text-text |
  // -------------
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

  // -------------
  // 2. host-host |
  // -------------
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

    const oldSomeKeyed = oldChildren.some((c) => c.vnode.key !== undefined);
    const oldAllKeyed = oldChildren.every((c) => c.vnode.key !== undefined);

    const newSomeKeyed = newChildren.some((c) => c.vnode.key !== undefined);
    const newAllKeyed = newChildren.every((c) => c.vnode.key !== undefined);

    const someKeyed = oldSomeKeyed || newSomeKeyed;
    const allKeyed = oldAllKeyed && newAllKeyed;

    if (someKeyed && !allKeyed) {
      throw new Error("🛑 Mixed keyed and unkeyed children are not supported");
    }

    if (!allKeyed) {
      // 2.3.1 Unkeyed - по индексу
      const maxLen = Math.max(oldChildren.length, newChildren.length);
      for (let i = 0; i < maxLen; i++) {
        const oldChild = oldChildren[i] ?? null;
        const newChild = newChildren[i] ?? null;

        if (oldChild && newChild) {
          // Рекурсивно сравниваем детей
          buildCommitOps(oldChild, newChild, ops);
        } else if (!oldChild && newChild) {
          // Новый ребенок добавлен
          collectPlacements(newChild, ops);
        } else if (oldChild && !newChild) {
          // Ребенок удален
          collectRemovals(oldChild, ops);
        }
      }
    } else {
      // 2.3.2 Keyed - по ключу
      const oldKeyToChild = new Map<string, KeyedOldChild>();

      oldChildren.forEach((child, index) => {
        oldKeyToChild.set(child.vnode.key!, { fiber: child, oldIndex: index });
      });

      for (const newChild of newChildren) {
        const key = newChild.vnode.key!;
        const matchedOld = oldKeyToChild.get(key);

        // Ребенок с таким ключом не найден - это новый ребенок
        if (!matchedOld) {
          collectPlacements(newChild, ops);
          continue;
        }

        // Ребенок с таким ключом найден - сравниваем их
        if (!isSameType(matchedOld.fiber, newChild)) {
          collectRemovals(matchedOld.fiber, ops);
          collectPlacements(newChild, ops);
        } else {
          // Ребенок с таким ключом и типом найден - рекурсивно сравниваем их
          buildCommitOps(matchedOld.fiber, newChild, ops);
        }

        // (По-хорошему здесь нужно сделать move, если элемент остался тем же, но поменял положение,
        // но для упрощения этого задания мы не будем это делать)

        // Удаляем из мапы, чтобы в конце в ней остались только удаленные дети
        oldKeyToChild.delete(key);
      }

      for (const { fiber } of oldKeyToChild.values()) {
        collectRemovals(fiber, ops);
      }
    }
  }

  return ops;
}

function isSameType(a: FiberNode, b: FiberWip) {
  if (a.kind !== b.kind) return false;

  if (a.kind === "host" && b.kind === "host") {
    return a.vnode.tag === b.vnode.tag;
  }

  if (a.kind === "text" && b.kind === "text") {
    return true;
  }

  if (a.kind === "fc" && b.kind === "fc") {
    return a.vnode.component === b.vnode.component;
  }

  return false;
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
