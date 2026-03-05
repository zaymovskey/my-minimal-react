import { render } from "./core/render";
import { createElement } from "./core/vdom/createElement";

const container = document.getElementById("root")!;

const App = () => {
  return createElement("div", null, createElement("span", null, "Hello world"));
};

const rootVNode = createElement(App, null);

render(rootVNode, container);
