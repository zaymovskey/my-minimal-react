import { createElement } from "./core/vdom/createElement";
import { TestComponent } from "./TestComponent";

export const App = () => {
  return createElement(
    "div",
    null,
    createElement("h1", null, "Hello world from App"),
    createElement(TestComponent, null),
  );
};

export const App2 = () => {
  return createElement(
    "div",
    null,
    createElement("h1", null, "Hello world from App2"),
    createElement(TestComponent, null),
  );
};
