import { buildFiberTree } from "./core/fiber/buildFiberTree";
import { createElement } from "./core/vdom/createElement";

const App = () => {
  return createElement("div", null, "Hello world");
};

const rootVNode = createElement(App, null);

const fiberTree = buildFiberTree(rootVNode);

console.log(fiberTree);
