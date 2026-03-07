import { applyCommit } from "./commitPhase.ts/applyCommit";
import { buildFiberTree } from "./fiber/buildFiberTree";
import type { FiberNode } from "./fiber/types";
import { buildCommitOps } from "./renderPhase/buildCommitOps";
import type { CommitOp } from "./commitPhase.ts/types";
import type { VNode } from "./vdom/types";

let currentFiberTree: FiberNode | null = null;

let currentRootVNode: VNode | null = null;
let currentContainer: HTMLElement | null = null;

export function render(vnode: VNode, container: HTMLElement): void {
  currentRootVNode = vnode;
  currentContainer = container;

  const wipFiberTree = buildFiberTree(vnode);
  const commitOps: CommitOp[] = [];

  // Первый рендер: currentFiberTree === null. Перерендеры: currentFiberTree !== null
  buildCommitOps(currentFiberTree, wipFiberTree, commitOps);
  applyCommit(commitOps, container);

  // После applyCommit все изменения уже применены к DOM,
  // поэтому мы можем безопасно считать FiberWip, который был в процессе работы,
  // полноценным FiberNode.
  const fiberTree = wipFiberTree as unknown as FiberNode;
  currentFiberTree = fiberTree;
}

export function scheduleUpdate() {
  if (!currentRootVNode || !currentContainer) {
    throw new Error("No root to rerender");
  }

  render(currentRootVNode, currentContainer);
}
