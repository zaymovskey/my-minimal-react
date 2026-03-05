import { buildFiberTree } from "./fiber/buildFiberTree";
import type { FiberNode } from "./fiber/types";
import type { VNode } from "./vdom/types";

let currentFiberTree: FiberNode | null = null;

export function render(vnode: VNode, container: HTMLElement): void {
  if (currentFiberTree) {
    // update
  } else {
    // initial render
    const fiberTree = buildFiberTree(vnode);
    currentFiberTree = fiberTree;
  }
}
