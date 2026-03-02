import { buildFiberTree } from "./core/fiber/buildFiberTree";
import { createElement } from "./core/vdom/createElement";

const App = () => {
  return createElement("div", null, "Hello world");
};

const rootVNode = createElement(App, null);

const fuberTree = buildFiberTree(rootVNode);

console.log(fuberTree);
