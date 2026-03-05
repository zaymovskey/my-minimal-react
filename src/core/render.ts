import { applyCommit } from "./commitPhase.ts/applyCommit";
import { buildFiberTree } from "./fiber/buildFiberTree";
import type { FiberNode } from "./fiber/types";
import { buildCommitOps } from "./renderPhase/buildCommitOps";
import type { CommitOp } from "./commitPhase.ts/types";
import type { VNode } from "./vdom/types";

let currentFiberTree: FiberNode | null = null;

export function render(vnode: VNode, container: HTMLElement): void {
  if (currentFiberTree) {
    // update
  } else {
    // initial render
    const wipFiberTree = buildFiberTree(vnode);

    const commitOps: CommitOp[] = [];
    buildCommitOps(null, wipFiberTree, commitOps);
    applyCommit(commitOps, container);

    // После applyCommit все изменения уже применены к DOM,
    // поэтому мы можем безопасно считать FiberWip, который был в процессе работы,
    // полноценным FiberNode.
    const fiberTree = wipFiberTree as unknown as FiberNode;
    currentFiberTree = fiberTree;
  }
}
