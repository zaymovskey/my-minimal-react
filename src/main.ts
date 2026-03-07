import { App } from "./App";
import { render } from "./core/render";
import { createElement } from "./core/vdom/createElement";

const container = document.getElementById("root")!;

const rootVNode = createElement(App, null);

render(rootVNode, container);

// export const App2 = () => {
//   return createElement(
//     "div",
//     null,
//     createElement("h1", null, "Hello world from App2"),
//     createElement("span", null, "This is a span element"),
//   );
// };

// setTimeout(() => {
//   const rootVNode2 = createElement(App2, null);
//   render(rootVNode2, container);
// }, 2000);
