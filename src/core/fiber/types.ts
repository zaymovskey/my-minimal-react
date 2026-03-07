import type { StateHook } from "../hooks/useState";
import type { FCVNode, HostVNode, TextVNode } from "../vdom/types";

export type FiberLinks<TSelf> = {
  parent: TSelf | null;
  child: TSelf | null;
  sibling: TSelf | null;
};

export interface HostFiber extends FiberLinks<FiberNode> {
  kind: "host";
  vnode: HostVNode;
  stateNode: HTMLElement;
}

export interface TextFiber extends FiberLinks<FiberNode> {
  kind: "text";
  vnode: TextVNode;
  stateNode: Text;
}

export interface FCFiber extends FiberLinks<FiberNode> {
  kind: "fc";
  vnode: FCVNode;
  stateNode: null;
  hooks: StateHook<unknown>[];
}

export type FiberNode = HostFiber | TextFiber | FCFiber;

export interface HostFiberWip extends FiberLinks<FiberWip> {
  kind: "host";
  vnode: HostVNode;
  stateNode: null;
}

export interface TextFiberWip extends FiberLinks<FiberWip> {
  kind: "text";
  vnode: TextVNode;
  stateNode: null;
}

export interface FCFiberWip extends FiberLinks<FiberWip> {
  kind: "fc";
  vnode: FCVNode;
  stateNode: null;
  hooks: StateHook<unknown>[];
}

export type FiberWip = HostFiberWip | TextFiberWip | FCFiberWip;

export type HostOrTextWip = Extract<FiberWip, { kind: "host" | "text" }>;
export type HostWip = Extract<FiberWip, { kind: "host" }>;
