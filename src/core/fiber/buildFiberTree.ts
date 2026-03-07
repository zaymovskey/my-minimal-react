import { beginComponentRender, endComponentRender } from "../hooks/useState";
import type { VNode } from "../vdom/types";
import type { FCFiberWip, FiberWip } from "./types";

export function buildFiberTree(vnode: VNode): FiberWip {
  let children: VNode[] = [];
  if (vnode.kind === "host") {
    children = vnode.children;
  }

  if (vnode.kind === "text") {
    children = [];
  }

  const fiber = createFiberWipFromVNode(vnode);

  if (vnode.kind === "fc") {
    // Раз vnode.kind === "fc", то мы точно знаем, что fiber - это FCFiberWip, поэтому можем сделать type assertion
    beginComponentRender(fiber as FCFiberWip);
    const rendered = vnode.component(vnode.props);
    children = [rendered];
    endComponentRender();
  }

  const fiberChildren = children.map(buildFiberTree);

  attachFiberChildren(fiber, fiberChildren);

  return fiber;
}

function attachFiberChildren(parent: FiberWip, children: FiberWip[]): void {
  parent.child = children[0] ?? null;

  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    child.parent = parent;
    child.sibling = children[i + 1] ?? null;
  }
}

function createFiberWipFromVNode(vnode: VNode): FiberWip {
  if (vnode.kind === "host") {
    return {
      kind: "host",
      vnode,
      parent: null,
      child: null,
      sibling: null,
      stateNode: null,
    };
  }
  if (vnode.kind === "text") {
    return {
      kind: "text",
      vnode,
      parent: null,
      child: null,
      sibling: null,
      stateNode: null,
    };
  }
  if (vnode.kind === "fc") {
    return {
      kind: "fc",
      vnode,
      parent: null,
      child: null,
      sibling: null,
      stateNode: null,
      hooks: [],
    };
  }

  throw new Error("Unknown vnode kind");
}
