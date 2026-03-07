import type { FCFiberWip } from "../fiber/types";
import { scheduleUpdate } from "../render";

export type StateHook<T> = {
  kind: "state";
  state: T;
};

let currentRenderingFiber: FCFiberWip | null = null;
let hookIndex = 0;

export function beginComponentRender(fiber: FCFiberWip) {
  currentRenderingFiber = fiber;
  hookIndex = 0;
}

export function endComponentRender() {
  currentRenderingFiber = null;
}

export function useState<T>(initialValue: T): [T, (newValue: T) => void] {
  if (!currentRenderingFiber) {
    throw new Error("useState can only be used inside a function component");
  }

  const fiber = currentRenderingFiber;

  const currentIndex = hookIndex;
  let currentHook = fiber.hooks[currentIndex] as StateHook<T> | undefined;

  if (!currentHook) {
    currentHook = {
      kind: "state",
      state: initialValue,
    };
    fiber.hooks[currentIndex] = currentHook;
  }

  hookIndex++;

  return [
    currentHook.state,
    (newValue: T) => {
      fiber.hooks[currentIndex].state = newValue;
      scheduleUpdate();
    },
  ];
}
