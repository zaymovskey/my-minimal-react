# Mini React Renderer (Abandoned Prototype)

## Что это было

Этот проект — попытка реализовать упрощённый React-подобный рендерер с нуля, чтобы глубоко понять внутреннюю архитектуру React:

- VNode модель
- Fiber дерево
- reconciliation
- commit phase
- обновление props
- keyed/unkeyed children diff

Целью проекта **не было создать библиотеку**, а понять механизмы работы React.

---

# Что удалось реализовать

В проекте реализованы следующие части React-подобного рендерера:

### VNode

JSX-подобная модель виртуальных нод:

- `host` — DOM элементы
- `text` — текстовые узлы
- `fc` — функциональные компоненты

---

### Fiber Tree

Для каждого `VNode` строится `Fiber` структура:

```
Fiber
 ├─ parent
 ├─ child
 ├─ sibling
 └─ stateNode (DOM)
```

Fiber используется как **рабочая структура для reconciliation**.

---

### Render Pipeline

Проект реализует двухфазный рендеринг:

```
buildFiberTree()
        ↓
buildCommitOps()
        ↓
applyCommit()
```

#### Render phase

Сравниваются:

```
oldFiber
newFiber
```

и формируется список операций:

```
placement
remove
updateText
updateProps
```

---

### Commit phase

Список операций применяется к DOM:

- создание DOM узлов
- удаление
- обновление props
- обновление текста

---

### Reconciliation

Реализованы два алгоритма:

#### Unkeyed

Сравнение детей по индексу.

```
oldChildren[i]
newChildren[i]
```

#### Keyed

Сравнение по `key` через `Map`.

```
key → oldChild
```

Это позволяет корректно обрабатывать:

- добавление
- удаление
- изменение типа элемента

Перемещение элементов (`move`) в проекте **не реализовано**.

---

# Где архитектура сломалась

Проблема возникла при попытке реализовать **hooks (useState)**.

Текущая архитектура проекта:

```
VNode → buildFiberTree() → newFiberTree
oldFiberTree + newFiberTree → diff
```

То есть **новое fiber дерево строится только из VNode**.

---

## Почему это ломает hooks

Hooks требуют доступа к **старому состоянию компонента**.

В React это выглядит так:

```
oldFiber
   ↓
render(component)
   ↓
newFiber
```

State хранится в:

```
fiber.hooks
```

Но в текущей архитектуре проекта во время выполнения компонента:

```
const rendered = component(props)
```

**старый fiber ещё неизвестен**.

Поэтому невозможно:

- получить предыдущий hook
- сохранить новый hook
- корректно реализовать useState

---

# Как это делает React

React использует модель:

```
currentFiber
      ↕
alternateFiber
```

Во время render phase создаётся **work-in-progress fiber**, связанный со старым через `alternate`.

```
oldFiber ↔ newFiber
```

Это позволяет:

- читать старые hooks
- создавать новые hooks
- переносить состояние между рендерами

---

# Почему этот проект был остановлен

Для поддержки hooks требуется изменить архитектуру:

```
buildFiberTree(vnode)
```

→

```
buildFiberTree(vnode, oldFiber)
```

То есть **fiber должен строиться одновременно из VNode и старого Fiber**.

Это изменение затрагивает:

- render pipeline
- построение fiber дерева
- reconciliation

Фактически это означает **переписать значительную часть проекта**.

---

# Итог

Проект успешно реализовал:

- базовую модель VNode
- Fiber дерево
- reconciliation
- commit phase
- diff props
- keyed children

Но архитектура оказалась **неподходящей для hooks**, потому что:

```
oldFiber не участвует в render phase
```

Из-за этого корректная реализация `useState` невозможна без переработки render pipeline.

---

# Чему научил этот проект

Несмотря на то, что проект не был доведён до полноценного React-подобного движка, он позволил понять:

- как работает reconciliation
- зачем нужен Fiber
- как работает commit phase
- почему hooks требуют доступа к старому fiber
- почему React использует alternate fiber

---

# Вывод

Этот проект оказался **полезным исследовательским прототипом**, но не может быть продолжен без изменения архитектуры render phase.
