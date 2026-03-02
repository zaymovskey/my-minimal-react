import type { FunctionalComponent, HostTag, Props, VNode } from "./types";

type ChildInput = VNode | string | number | boolean | null | undefined;

function normalizeChildren(raw: ChildInput[]): VNode[] {
  const out: VNode[] = [];
  for (const c of raw) {
    if (c == null || c === false || c === true) continue;
    if (typeof c === "string" || typeof c === "number") {
      out.push({ kind: "text", value: String(c) });
    } else {
      out.push(c);
    }
  }
  return out;
}

// Host
export function createElement(
  tag: HostTag,
  props: Props | null,
  ...children: ChildInput[]
): VNode;

// FC
export function createElement<P extends Props>(
  component: FunctionalComponent<P>,
  props: P | null,
  ...children: ChildInput[]
): VNode;

export function createElement(
  type: HostTag | FunctionalComponent<any>,
  rawProps: Props | null,
  ...rawChildren: ChildInput[]
): VNode {
  const props: Props = rawProps ?? {};

  const children = normalizeChildren(rawChildren);

  // children живут в props для ВСЕХ, включая FC (как в React)
  (props as any).children = children;

  if (typeof type === "string") {
    // у host есть отдельное поле children (удобно для reconcile/DOM)
    return { kind: "host", tag: type, props, children };
  }

  // у FC нет отдельного children — только props.children
  return { kind: "fc", component: type, props };
}
