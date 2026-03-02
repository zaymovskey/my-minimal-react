import type { VNode } from "../vdom/types";

export type FiberNode = {
  kind: "fc" | "host" | "text";
  vnode: VNode;

  parent: FiberNode | null;
  child: FiberNode | null;
  sibling: FiberNode | null;

  stateNode: HTMLElement | Text | null;
};
