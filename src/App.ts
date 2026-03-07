import { useState } from "./core/hooks/useState";
import { createElement } from "./core/vdom/createElement";
import { TestComponent } from "./TestComponent";

export const App = () => {
  const [count, setCount] = useState(0);

  return createElement(
    "div",
    null,
    createElement("h1", null, "Hello world from App"),
    createElement(TestComponent, null),
    createElement(
      "button",
      {
        onClick: () => {
          setCount(count + 1);
        },
      },
      "+",
    ),
    createElement("span", null, `Count: ${count}`),
  );
};
