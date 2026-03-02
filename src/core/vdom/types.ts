export type Props = Record<string, unknown>;

export type HostTag = keyof HTMLElementTagNameMap;
export type FunctionalComponent<P extends Props = Props> = (props: P) => VNode;

export type VNode = HostVNode | TextVNode | FCVNode;

export type HostVNode = {
  kind: "host";
  tag: HostTag;
  props: Props;
  children: VNode[];
};

export type TextVNode = {
  kind: "text";
  value: string;
};

export type FCVNode = {
  kind: "fc";
  component: FunctionalComponent<any>;
  props: Props;
};
