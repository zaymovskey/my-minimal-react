import type {
  ElementProps,
  FunctionalComponent,
  HostTag,
  Props,
  VNode,
} from "./types";

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
  props: ElementProps | null,
  ...children: ChildInput[]
): VNode;

// FC
export function createElement<P extends ElementProps>(
  component: FunctionalComponent<P>,
  props: P | null,
  ...children: ChildInput[]
): VNode;

export function createElement(
  type: HostTag | FunctionalComponent<any>,
  rawProps: ElementProps | null,
  ...rawChildren: ChildInput[]
): VNode {
  const children = normalizeChildren(rawChildren);

  const key = rawProps?.key ?? null;
  if (key != null && typeof key !== "string") {
    throw new Error("🛑 Key must be a string");
  }

  const props: Props = {
    ...(rawProps ?? {}),
    children,
  };

  delete props.key;

  if (typeof type === "string") {
    return {
      kind: "host",
      tag: type,
      props,
      children,
      key: key ?? undefined,
    };
  }

  return {
    kind: "fc",
    component: type,
    props,
    key: key ?? undefined,
  };
}
