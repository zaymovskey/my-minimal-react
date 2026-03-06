export type Props = Record<string, unknown> & {
  children: VNode[];
};

export type ElementProps = Record<string, unknown> & {
  children?: VNode[];
  key?: string;
};

export type HostTag = keyof HTMLElementTagNameMap;
export type FunctionalComponent<P extends ElementProps = ElementProps> = (
  props: P,
) => VNode;

export type VNode = HostVNode | TextVNode | FCVNode;

export type HostVNode = {
  kind: "host";
  tag: HostTag;
  props: Props;
  children: VNode[];
  key?: string;
};

export type TextVNode = {
  kind: "text";
  value: string;
  key?: string;
};

export type FCVNode = {
  kind: "fc";
  component: FunctionalComponent<any>;
  props: Props;
  key?: string;
};
