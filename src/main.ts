import { App, App2 } from "./App";
import { render } from "./core/render";
import { createElement } from "./core/vdom/createElement";

const container = document.getElementById("root")!;

const rootVNode = createElement(App, null);

render(rootVNode, container);

setTimeout(() => {
  const rootVNode2 = createElement(App2, null);
  render(rootVNode2, container);
}, 2000);
