import type { FiberNode, FiberWip } from "../fiber/types";
import type { CommitOp } from "../renderPhase/types";

export function applyCommit(ops: CommitOp[], container: Node): void {
  for (const op of ops) {
    switch (op.type) {
      case "append": {
        op.parent.appendChild(op.node);
        break;
      }

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
        // При первом рендере parentFiber будет null, тогда родителем для нового узла будет контейнер
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
    }
  }
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
