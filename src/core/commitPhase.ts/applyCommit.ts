import type { FiberNode, FiberWip } from "../fiber/types";
import type { CommitOp } from "./types";

export function applyCommit(ops: CommitOp[], container: Node): void {
  for (const op of ops) {
    switch (op.type) {
      case "remove": {
        op.node.parentNode?.removeChild(op.node);
        break;
      }

      case "updateText": {
        op.node.textContent = op.text;
        break;
      }

      case "placement": {
        const { fiber, parentFiber } = op;
        const domNode = createDomNodeForFiber(fiber);

        if (fiber.kind === "host") {
          applyProps(domNode as HTMLElement, {}, fiber.vnode.props);
        }

        // При первом рендере parentFiber у первого родителя будет null, поэтому используем container.
        // Остальные опции будут с ненулевым parentFiber, так как мы рекурсивно обрабатываем всех детей.
        const parentNode = parentFiber ? parentFiber.stateNode : container;
        if (!parentNode) {
          throw new Error("🛑 Parent host DOM is missing (wrong ops order?)");
        }
        parentNode.appendChild(domNode);

        // В этот момент FiberWip превращается в FiberNode, так как мы уже применили все изменения к DOM
        const fiberNode = fiber as unknown as FiberNode;
        fiberNode.stateNode = domNode;

        break;
      }

      case "updateProps": {
        applyProps(op.node, op.prev, op.next);
        break;
      }
    }
  }
}

function isEventProp(key: string): boolean {
  return (
    key.startsWith("on") && key.length > 2 && key[2] === key[2].toUpperCase()
  );
}

function createDomNodeForFiber(
  fiber: Extract<FiberWip, { kind: "host" | "text" }>,
): HTMLElement | Text {
  if (fiber.kind === "host") {
    return document.createElement(fiber.vnode.tag);
  }
  if (fiber.kind === "text") {
    return document.createTextNode(fiber.vnode.value);
  }

  throw new Error("🛑 Only host and text fibers can be placed in the DOM");
}

function applyProps(
  node: HTMLElement,
  prev: Record<string, unknown>,
  next: Record<string, unknown>,
) {
  for (const prevKey in prev) {
    if (prevKey === "children") continue;

    if (!(prevKey in next)) {
      if (isEventProp(prevKey)) {
        const eventName = prevKey.slice(2).toLowerCase();
        node.removeEventListener(eventName, prev[prevKey] as EventListener);
      } else {
        const attr = prevKey === "className" ? "class" : prevKey;
        node.removeAttribute(attr);
      }
    }
  }

  for (const nextKey in next) {
    if (nextKey === "children") continue;

    if (prev[nextKey] !== next[nextKey]) {
      if (isEventProp(nextKey)) {
        const eventName = nextKey.slice(2).toLowerCase();

        if (prev[nextKey]) {
          node.removeEventListener(eventName, prev[nextKey] as EventListener);
        }

        node.addEventListener(eventName, next[nextKey] as EventListener);
      } else {
        const attr = nextKey === "className" ? "class" : nextKey;
        node.setAttribute(attr, String(next[nextKey]));
      }
    }
  }
}
