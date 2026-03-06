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
        // Удалить старые
        for (const prevKey in op.prev) {
          if (!(prevKey in op.next)) {
            op.node.removeAttribute(prevKey);
          }
        }
        // Добавить новые
        for (const nextKey in op.next) {
          if (op.prev[nextKey] !== op.next[nextKey]) {
            if (isEventProp(nextKey)) {
              const eventName = nextKey.slice(2).toLowerCase();
              if (op.prev[nextKey]) {
                op.node.removeEventListener(eventName, op.prev[nextKey]);
              }
              op.node.addEventListener(eventName, op.next[nextKey]);
              continue;
            }

            const attr = nextKey === "className" ? "class" : nextKey;
            op.node.setAttribute(attr, String(op.next[nextKey]));
          }
        }
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
