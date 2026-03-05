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
