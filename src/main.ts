import { createElement } from "./core/vdom/createElement";

const App = () => {
  return createElement("div", null, "Hello world");
};

const rootVNode = createElement(App, null);

console.log(rootVNode);
