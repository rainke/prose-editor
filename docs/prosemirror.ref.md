# ProseMirror 参考手册

这是 [ProseMirror](https://prosemirror.net/) 富文本编辑器的参考手册。它列出并描述了库导出的完整公共 API。有关更多介绍性材料，请参阅 [指南](https://prosemirror.net/docs/guide/)。

ProseMirror 的结构由许多独立的模块组成。本参考手册按模块描述了导出的 API。例如，如果你想使用 `prosemirror-state` 模块中的某些内容，你可以这样导入：

```javascript
var EditorState = require("prosemirror-state").EditorState
var state = EditorState.create({schema: mySchema})
```

或者，使用 ES6 语法：

```javascript
import {EditorState} from "prosemirror-state"
let state = EditorState.create({schema: mySchema})
```

## prosemirror-state 模块

这个模块实现了 ProseMirror 编辑器的状态对象，以及选择（selection）的表示和插件抽象。

### Editor State (编辑器状态)

ProseMirror 将所有编辑器状态（基本上是创建与当前编辑器完全一样的编辑器所需的所有内容）保存在单个对象中。该对象通过应用事务（transaction）进行更新（从而创建一个新状态）。

#### `class` EditorState

ProseMirror 编辑器的状态由这种类型的对象表示。状态是一个持久性数据结构——它不会被更新，而是使用 `apply` 方法从旧状态计算出一个新状态值。

状态包含许多内置字段，插件也可以定义其他字段。

*   **`doc`: `Node`**
    当前文档。

*   **`selection`: `Selection`**
    当前选择。

*   **`storedMarks`: `readonly Mark[] | null`**
    应用于下一次输入的标记集合。当没有设置显式标记时，将为 null。

*   **`schema`: `Schema`**
    状态文档的架构（schema）。

*   **`plugins`: `readonly Plugin[]`**
    在此状态下处于活动状态的插件。

*   **`apply(tr: Transaction) → EditorState`**
    应用给定的事务以生成新状态。

*   **`applyTransaction(rootTr: Transaction) → {state: EditorState, transactions: readonly Transaction[]}`**
    `apply` 的详细变体，返回实际应用的事务（可能会受到插件事务钩子的影响）以及新状态。

*   **`tr`: `Transaction`**
    构造并返回从此状态开始的新事务的访问器。

*   **`reconfigure(config: Object) → EditorState`**
    基于此状态创建一个新状态，但具有调整后的活动插件集。两个插件集中都存在的状态字段保持不变。不再存在的字段将被丢弃，新的字段将使用其 `init` 方法进行初始化，并传入新的配置对象。
    *   **`config`**
        *   **`plugins`: `readonly Plugin[]`** (可选) 新的活动插件集。

*   **`toJSON(pluginFields?: Object<Plugin>) → any`**
    将此状态序列化为 JSON。如果要序列化插件的状态，请传递一个对象，将生成的 JSON 对象中使用的属性名称映射到插件对象。参数也可以是字符串或数字，在这种情况下它将被忽略，以支持 `JSON.stringify` 调用 `toString` 方法的方式。

*   **`static create(config: EditorStateConfig) → EditorState`**
    创建一个新状态。

*   **`static fromJSON(config: Object, json: any, pluginFields?: Object<Plugin>) → EditorState`**
    反序列化状态的 JSON 表示。`config` 应至少有一个 `schema` 字段，并且应包含用于初始化状态的插件数组。`pluginFields` 可用于通过将插件实例与它们在 JSON 对象中使用的属性名称相关联来反序列化插件的状态。
    *   **`config`**
        *   **`schema`: `Schema`** 使用的架构。
        *   **`plugins`: `readonly Plugin[]`** (可选) 活动插件集。

#### `interface` EditorStateConfig

传递给 `EditorState.create` 的对象类型。

*   **`schema`: `Schema`** (可选)
    使用的架构（仅在未指定 `doc` 时相关）。

*   **`doc`: `Node`** (可选)
    起始文档。必须提供此项或 `schema`。

*   **`selection`: `Selection`** (可选)
    文档中的有效选择。

*   **`storedMarks`: `readonly Mark[]`** (可选)
    初始存储标记集。

*   **`plugins`: `readonly Plugin[]`** (可选)
    在此状态下应处于活动状态的插件。

#### `class` Transaction `extends` Transform

编辑器状态事务，可以应用于状态以创建更新后的状态。使用 `EditorState.tr` 创建实例。

事务跟踪文档的更改（它们是 `Transform` 的子类），但也跟踪其他状态更改，如选择更新和存储标记集的调整。此外，您可以在事务中存储元数据属性，这是客户端代码或插件可以用来描述事务代表什么的额外信息，以便它们可以相应地更新自己的状态。

编辑器视图使用一些元数据属性：它会将值为 `true` 的 `"pointer"` 属性附加到由鼠标或触摸输入直接引起的选择事务，将包含标识导致它的组合 ID 的 `"composition"` 属性附加到由组合 DOM 输入引起的事务，以及可能为 `"paste"`、`"cut"` 或 `"drop"` 的 `"uiEvent"` 属性。

*   **`time`: `number`**
    事务的时间戳。由 `EditorState.apply` 用于构建新状态的 `storedMarks`。

*   **`storedMarks`: `readonly Mark[] | null`**
    此事务中设置的存储标记。

*   **`selection`: `Selection`**
    事务的当前选择。这在事务创建时默认为编辑器选择，并由 `replaceSelection` 等方法更新。

*   **`setSelection(selection: Selection) → Transaction`**
    更新事务的选择。

*   **`selectionSet`: `boolean`**
    是否已为此事务显式设置选择。

*   **`setStoredMarks(marks: readonly Mark[] | null) → Transaction`**
    设置（或清除，如果为 null）存储的标记。

*   **`ensureMarks(marks: readonly Mark[]) → Transaction`**
    确保当前存储的标记或（如果为 null）当前选择处的标记与给定的标记集匹配。

*   **`addStoredMark(mark: Mark) → Transaction`**
    向存储的标记添加一个标记。

*   **`removeStoredMark(mark: Mark | MarkType) → Transaction`**
    从存储的标记中移除一个标记或标记类型。

*   **`storedMarksSet`: `boolean`**
    是否已为此事务显式设置存储标记。

*   **`setTime(time: number) → Transaction`**
    更新事务的时间戳。

*   **`replaceSelection(slice: Slice) → Transaction`**
    用给定的切片替换当前选择。

*   **`replaceSelectionWith(node: Node, inheritMarks?: boolean = true) → Transaction`**
    用给定的节点替换选择。当 `inheritMarks` 为 true 且内容是内联时，它会从插入位置继承标记。

*   **`deleteSelection() → Transaction`**
    删除选择。

*   **`insertText(text: string, from?: number, to?: number) → Transaction`**
    用包含给定字符串的文本节点替换给定范围（如果未给出范围，则为选择）。

*   **`setMeta(key: string | Plugin | PluginKey, value: any) → Transaction`**
    在此事务中存储元数据属性，按名称或插件键控。

*   **`getMeta(key: string | Plugin | PluginKey) → any`**
    检索给定名称或插件的元数据属性。

*   **`isGeneric`: `boolean`**
    如果此事务不包含任何元数据，因此可以安全地扩展，则返回 true。

*   **`scrollIntoView() → Transaction`**
    指示编辑器在更新到由此事务生成的状态时应将选择滚动到视图中。

*   **`scrolledIntoView`: `boolean`**
    当对此事务调用了 `scrollIntoView` 时为 True。

*   **`type Command = fn(state: EditorState, dispatch?: fn(tr: Transaction), view?: EditorView) → boolean`**
    命令是接受状态和可选的事务分发函数的函数，并且...
    *   确定它们是否适用于此状态
    *   如果不适用，返回 false
    *   如果传递了 `dispatch`，则执行其效果，可能通过将事务传递给 `dispatch`
    *   返回 true
    在某些情况下，编辑器视图作为第三个参数传递。

### Selection (选择)

ProseMirror 选择可以是几种类型之一。此模块定义了经典文本选择（光标是特例）和节点选择（选择特定文档节点）的类型。可以使用自定义选择类型扩展编辑器。

#### `abstract class` Selection

编辑器选择的超类。每个选择类型都应扩展此类。不应直接实例化。

*   **`new Selection($anchor: ResolvedPos, $head: ResolvedPos, ranges?: readonly SelectionRange[])`**
    使用 head 和 anchor 以及范围初始化选择。如果未给出范围，则在 `$anchor` 和 `$head` 之间构造单个范围。

*   **`$anchor`: `ResolvedPos`**
    选择的解析锚点（修改选择时保持在原位的一侧）。

*   **`$head`: `ResolvedPos`**
    选择的解析头部（修改选择时移动的一侧）。

*   **`ranges`: `readonly SelectionRange[]`**
    选择覆盖的范围。

*   **`anchor`: `number`**
    选择的锚点，作为未解析的位置。

*   **`head`: `number`**
    选择的头部。

*   **`from`: `number`**
    选择主要范围的下界。

*   **`to`: `number`**
    选择主要范围的上界。

*   **`$from`: `ResolvedPos`**
    选择主要范围的解析下界。

*   **`$to`: `ResolvedPos`**
    选择主要范围的解析上界。

*   **`empty`: `boolean`**
    指示选择是否包含任何内容。

*   **`abstract eq(selection: Selection) → boolean`**
    测试选择是否与另一个选择相同。

*   **`abstract map(doc: Node, mapping: Mappable) → Selection`**
    通过可映射对象映射此选择。`doc` 应该是我们要映射到的新文档。

*   **`content() → Slice`**
    获取此选择的内容作为切片。

*   **`replace(tr: Transaction, content?: Slice = Slice.empty)`**
    用切片替换选择，如果未给出切片，则删除选择。将追加到给定的事务。

*   **`replaceWith(tr: Transaction, node: Node)`**
    用给定节点替换选择，将更改追加到给定的事务。

*   **`abstract toJSON() → any`**
    将选择转换为 JSON 表示。为自定义选择类实现此方法时，请确保为对象提供一个 `type` 属性，其值与注册类时使用的 ID 匹配。

*   **`getBookmark() → SelectionBookmark`**
    获取此选择的书签，这是一个可以在不访问当前文档的情况下映射的值，稍后可以再次解析为给定文档的实际选择。（这主要由历史记录用于跟踪和恢复旧选择。）此方法的默认实现只是将选择转换为文本选择并返回其书签。

*   **`visible`: `boolean`**
    控制当此类型的选择在浏览器中处于活动状态时，是否应隐藏 DOM 选择。默认为 `true`。

*   **`static findFrom($pos: ResolvedPos, dir: number, textOnly?: boolean = false) → Selection | null`**
    在给定位置附近查找有效的光标或叶节点选择，如果在该位置有效则搜索该位置，否则按 `dir`（负数为向后）指示的方向移动。

*   **`static near($pos: ResolvedPos, bias?: number = 1) → Selection`**
    在给定位置附近查找有效的光标或叶节点选择。

*   **`static atStart(doc: Node) → Selection`**
    在给定文档的开头查找光标或叶节点选择。

*   **`static atEnd(doc: Node) → Selection`**
    在文档末尾查找光标或叶节点选择。

*   **`static fromJSON(doc: Node, json: any) → Selection`**
    从 JSON 表示反序列化选择。

*   **`static jsonID(id: string, constructorClass: {fromJSON: fn(doc: Node, json: any) → Selection})`**
    为自定义选择类注册 JSON ID 名称。

#### `class` TextSelection `extends` Selection

文本选择表示经典的编辑器选择，具有头部（移动侧）和锚点（固定侧），两者都指向文本块节点。它可以是空的（常规光标位置）。

*   **`new TextSelection($anchor: ResolvedPos, $head?: ResolvedPos = $anchor)`**
    在给定点之间构造文本选择。

*   **`$cursor`: `ResolvedPos | null`**
    如果这是光标选择（空文本选择），则返回解析位置，否则返回 null。

*   **`static create(doc: Node, anchor: number, head?: number = anchor) → TextSelection`**
    从非解析位置创建文本选择。

*   **`static between($anchor: ResolvedPos, $head: ResolvedPos, bias?: number) → Selection`**
    返回跨越给定位置的文本选择，如果它们之间没有有效的文本选择位置，则返回覆盖它们的节点选择。

#### `class` NodeSelection `extends` Selection

节点选择是指向单个节点的选择。所有标记为可选择的节点都可以是节点选择的目标。在这样的选择中，`from` 和 `to` 直接指向所选节点的前后，`anchor` 等于 `from`，`head` 等于 `to`。

*   **`new NodeSelection($pos: ResolvedPos)`**
    创建节点选择。不验证其参数的有效性。

*   **`node`: `Node`**
    所选节点。

*   **`static create(doc: Node, from: number) → NodeSelection`**
    从非解析位置创建节点选择。

*   **`static isSelectable(node: Node) → boolean`**
    确定节点是否可选择。

#### `class` AllSelection `extends` Selection

表示选择整个文档的选择类型（这不一定能用文本选择表示，例如当文档开头或结尾有叶块节点时）。

*   **`new AllSelection(doc: Node)`**
    在给定文档上创建全选。

#### `class` SelectionRange

表示文档中的选定范围。

*   **`new SelectionRange($from: ResolvedPos, $to: ResolvedPos)`**
    创建范围。

*   **`$from`: `ResolvedPos`**
    范围的下界。

*   **`$to`: `ResolvedPos`**
    范围的上界。

#### `interface` SelectionBookmark

选择的轻量级、独立于文档的表示。您可以为自定义选择类定义自定义书签类型，以使历史记录能够很好地处理它。

*   **`map(mapping: Mappable) → SelectionBookmark`**
    通过一组更改映射书签。

*   **`resolve(doc: Node) → Selection`**
    再次将书签解析为实际选择。这可能需要进行一些错误检查，如果映射使书签无效，则可能会回退到默认值（通常是 TextSelection.between）。

### Plugin System (插件系统)

为了便于打包和启用额外的编辑器功能，ProseMirror 有一个插件系统。

#### `interface` PluginSpec`<PluginState>`

这是传递给 `Plugin` 构造函数的对象类型。它提供插件的定义。

*   **`props`: `EditorProps<Plugin<PluginState>>`** (可选)
    此插件添加的 [编辑器属性](#view.EditorProps)。

*   **`state`: `StateField<PluginState>`** (可选)
    允许插件定义状态字段，这是一个额外的槽位，用于保存插件自己的状态。

*   **`key`: `PluginKey<PluginState>`** (可选)
    可用于使插件在状态中通过键查找，或向其添加元数据。

*   **`view`: `fn(view: EditorView) → PluginView`** (可选)
    当插件需要与编辑器视图交互或设置 DOM 事件处理程序时，可以使用此选项。该函数将在初始化插件的编辑器视图创建时被调用。

*   **`filterTransaction`: `fn(tr: Transaction, state: EditorState) → boolean`** (可选)
    当存在时，这将在应用事务之前被调用。如果它返回 false，事务将被丢弃。

*   **`appendTransaction`: `fn(transactions: readonly Transaction[], oldState: EditorState, newState: EditorState) → Transaction | null | undefined`** (可选)
    允许插件在给定的事务数组应用后追加另一个事务。

*   **`[string]: any`**
    插件规范上允许其他属性，可以通过 `Plugin.spec` 读取。

#### `interface` StateField`<T>`

插件状态字段定义。

*   **`init(config: EditorStateConfig, instance: EditorState) → T`**
    初始化此字段的值。`config` 是传递给 `EditorState.create` 的对象。

*   **`apply(tr: Transaction, value: T, oldState: EditorState, newState: EditorState) → T`**
    将此字段应用到事务以确定其新值。

*   **`toJSON`: `fn(value: T) → any`** (可选)
    将此字段转换为 JSON。

*   **`fromJSON`: `fn(config: EditorStateConfig, value: any, state: EditorState) → T`** (可选)
    反序列化此字段的 JSON 表示。

#### `type` PluginView

插件可以安装在编辑器中的有状态对象。

*   **`update`: `fn(view: EditorView, prevState: EditorState)`** (可选)
    每当视图状态更新时调用。

*   **`destroy`: `fn()`** (可选)
    当视图被销毁或接收到具有不同插件的状态时调用。

#### `class` Plugin`<PluginState = any>`

插件。

*   **`new Plugin(spec: PluginSpec<PluginState>)`**
    创建插件。

*   **`spec`: `PluginSpec<PluginState>`**
    插件的配置对象。

*   **`props`: `EditorProps<Plugin<PluginState>>`**
    此插件导出的属性。

*   **`getState(state: EditorState) → PluginState | undefined`**
    从编辑器状态中提取插件的状态。

#### `class` PluginKey`<PluginState = any>`

插件的键。旨在传递给插件构造函数中的 `key` 属性。

*   **`new PluginKey(name?: string = "key")`**
    创建插件键。

*   **`get(state: EditorState) → Plugin<PluginState> | undefined`**
    获取具有此键的活动插件。

*   **`getState(state: EditorState) → PluginState | undefined`**
    从编辑器状态获取插件的状态。

## prosemirror-view 模块

ProseMirror 的视图模块在 DOM 中显示给定的编辑器状态，并处理用户事件。

使用此模块时，请确保加载 `style/prosemirror.css` 作为样式表。

#### `class` EditorView

编辑器视图管理表示可编辑文档的 DOM 结构。其状态和行为由其属性（props）决定。

*   **`new EditorView(place: DOMNode | fn(editor: HTMLElement) | {mount: HTMLElement} | null, props: DirectEditorProps)`**
    创建视图。`place` 可以是编辑器应追加到的 DOM 节点，或者是将编辑器放入文档的函数，或者是其 `mount` 属性持有用作文档容器的节点的对象。如果是 `null`，编辑器将不会添加到文档中。

*   **`state`: `EditorState`**
    视图的当前状态。

*   **`dom`: `HTMLElement`**
    包含文档的可编辑 DOM 节点。（您可能不应直接干预其内容。）

*   **`editable`: `boolean`**
    指示编辑器当前是否可编辑。

*   **`dragging`: `{slice: Slice, move: boolean} | null`**
    当编辑器内容被拖动时，此对象包含有关拖动切片以及它是被复制还是移动的信息。在任何其他时间，它都是 null。

*   **`composing`: `boolean`**
    如果视图正在处理 IME 组合，则为 true。

*   **`props`: `DirectEditorProps`**
    视图的当前属性。

*   **`update(props: DirectEditorProps)`**
    更新视图的属性。将立即导致 DOM 更新。

*   **`setProps(props: DirectEditorProps)`**
    更新视图的属性。

*   **`updateState(state: EditorState)`**
    用新状态更新视图。

*   **`someProp<PropName extends keyof EditorProps, Result>(propName: PropName, f: fn(value: NonNullable<EditorProps[PropName]>) → Result) → Result | undefined`**
    遍历此视图的属性集（首先是直接属性，然后是插件的属性），并为具有给定名称属性的每个属性集调用 `f`。当 `f` 返回真值时，立即返回该值。

*   **`hasFocus()` → `boolean`**
    查询视图是否具有焦点。

*   **`focus()`**
    将焦点移至编辑器。

*   **`root`: `Document | ShadowRoot`**
    获取包含编辑器的文档或影子根。

*   **`posAtCoords(coords: {left: number, top: number}) → {pos: number, inside: number} | null`**
    给定一对视口坐标，返回与其对应的文档位置。

*   **`coordsAtPos(pos: number, side?: number = 1) → {left: number, right: number, top: number, bottom: number}`**
    返回给定文档位置的视口矩形。

*   **`domAtPos(pos: number, side?: number = 0) → {node: DOMNode, offset: number}`**
    查找与给定文档位置对应的 DOM 位置。

*   **`nodeDOM(pos: number) → DOMNode | null`**
    查找表示给定位置后文档节点的 DOM 节点。

*   **`posAtDOM(node: DOMNode, offset: number, bias?: number = -1) → number`**
    查找与给定 DOM 位置对应的文档位置。

*   **`endOfTextblock(dir: "up" | "down" | "left" | "right" | "forward" | "backward", state?: EditorState) → boolean`**
    查明选择是否在按给定方向移动时位于文本块的末尾。

*   **`pasteHTML(html: string, event?: ClipboardEvent) → boolean`**
    使用给定的纯文本输入运行编辑器的粘贴逻辑。

*   **`serializeForClipboard(slice: Slice) → {dom: HTMLElement, text: string, slice: Slice}`**
    序列化给定的切片，就像它是从此编辑器复制的一样。

*   **`destroy()`**
    从 DOM 中移除编辑器并销毁所有节点视图。

*   **`isDestroyed`: `boolean`**
    当视图已被销毁时为 true。

*   **`dispatch(tr: Transaction)`**
    分发事务。

### Props (属性)

#### `interface` EditorProps`<P = any>`

属性是配置编辑器行为的对象。

*   **`handleDOMEvents`: `Object<fn(view: EditorView, event: Event) → boolean | undefined>`** (可选)
    可以定义 DOM 事件处理程序。

*   **`handleKeyDown`: `fn(view: EditorView, event: KeyboardEvent) → boolean | undefined`** (可选)
    每当按下键时调用。

*   **`handleKeyPress`: `fn(view: EditorView, event: KeyboardEvent) → boolean | undefined`** (可选)
    每当发生按键事件时调用。

*   **`handleTextInput`: `fn(view: EditorView, from: number, to: number, text: string) → boolean | undefined`** (可选)
    每当用户直接输入文本时调用。

*   **`handleClickOn`: `fn(view: EditorView, pos: number, node: Node, nodePos: number, event: MouseEvent, direct: boolean) → boolean | undefined`** (可选)
    每当用户点击编辑器内部时调用。

*   **`handleClick`: `fn(view: EditorView, pos: number, event: MouseEvent) → boolean | undefined`** (可选)
    当编辑器被点击时调用，在 `handleClickOn` 处理程序之后。

*   **`handleDoubleClickOn`: `fn(view: EditorView, pos: number, node: Node, nodePos: number, event: MouseEvent, direct: boolean) → boolean | undefined`** (可选)
    与 `handleClickOn` 相同，但用于双击。

*   **`handleDoubleClick`: `fn(view: EditorView, pos: number, event: MouseEvent) → boolean | undefined`** (可选)
    与 `handleClick` 相同，但用于双击。

*   **`handleTripleClickOn`: `fn(view: EditorView, pos: number, node: Node, nodePos: number, event: MouseEvent, direct: boolean) → boolean | undefined`** (可选)
    与 `handleClickOn` 相同，但用于三次点击。

*   **`handleTripleClick`: `fn(view: EditorView, pos: number, event: MouseEvent) → boolean | undefined`** (可选)
    与 `handleClick` 相同，但用于三次点击。

*   **`handlePaste`: `fn(view: EditorView, event: ClipboardEvent, slice: Slice) → boolean | undefined`** (可选)
    可用于覆盖粘贴行为。

*   **`handleDrop`: `fn(view: EditorView, event: DragEvent, slice: Slice, moved: boolean) → boolean | undefined`** (可选)
    当有东西被放到编辑器上时调用。

*   **`handleScrollToSelection`: `fn(view: EditorView) → boolean`** (可选)
    当视图尝试将选择滚动到视图中时调用。

*   **`createSelectionBetween`: `fn(view: EditorView, anchor: ResolvedPos, head: ResolvedPos) → Selection | null`** (可选)
    可用于覆盖在给定的锚点和头部之间读取 DOM 选择时创建选择的方式。

*   **`domParser`: `DOMParser`** (可选)
    从 DOM 读取编辑器更改时使用的解析器。

*   **`transformPastedHTML`: `fn(html: string, view: EditorView) → string`** (可选)
    可用于在解析之前转换粘贴的 HTML 文本。

*   **`clipboardParser`: `DOMParser`** (可选)
    从剪贴板读取内容时使用的解析器。

*   **`transformPastedText`: `fn(text: string, plain: boolean, view: EditorView) → string`** (可选)
    转换粘贴的纯文本。

*   **`transformPasted`: `fn(slice: Slice, view: EditorView, plain: boolean) → Slice`** (可选)
    可用于在将粘贴或拖放的内容应用到文档之前对其进行转换。

*   **`transformCopied`: `fn(slice: Slice, view: EditorView) → Slice`** (可选)
    可用于在将复制或剪切的内容序列化到剪贴板之前对其进行转换。

*   **`nodeViews`: `Object<NodeViewConstructor>`** (可选)
    允许您为节点传递自定义渲染和行为逻辑。

*   **`markViews`: `Object<MarkViewConstructor>`** (可选)
    传递自定义标记渲染函数。

*   **`clipboardSerializer`: `DOMSerializer`** (可选)
    将内容放入剪贴板时使用的 DOM 序列化器。

*   **`clipboardTextSerializer`: `fn(content: Slice, view: EditorView) → string`** (可选)
    复制文本到剪贴板时获取文本的函数。

*   **`decorations`: `fn(state: EditorState) → DecorationSource | null | undefined`** (可选)
    要在视图中显示的一组文档装饰。

*   **`editable`: `fn(state: EditorState) → boolean`** (可选)
    当此函数返回 false 时，视图内容不可直接编辑。

*   **`attributes`: `Object<string> | fn(state: EditorState) → Object<string>`** (可选)
    控制可编辑元素的 DOM 属性。

*   **`scrollThreshold`: `number | {top: number, right: number, bottom: number, left: number}`** (可选)
    确定光标与可见视口边缘之间的距离（以像素为单位），在该距离处，当将光标滚动到视图中时，会发生滚动。

*   **`scrollMargin`: `number | {top: number, right: number, bottom: number, left: number}`** (可选)
    确定将光标滚动到视图中时，光标上方或下方留出的额外空间（以像素为单位）。

#### `interface` DirectEditorProps `extends` EditorProps

直接提供给编辑器视图的 props 对象支持一些不能在插件中使用的字段：

*   **`state`: `EditorState`**
    编辑器的当前状态。

*   **`plugins`: `readonly Plugin[]`** (可选)
    在视图中使用的一组插件。

*   **`dispatchTransaction`: `fn(tr: Transaction)`** (可选)
    用于发送视图生成的事务（状态更新）的回调。

#### `interface` NodeView

默认情况下，文档节点使用其规范的 `toDOM` 方法的结果进行渲染，并完全由编辑器管理。对于某些用例，例如嵌入式节点特定编辑界面，您需要更多地控制节点的编辑器内表示，并需要定义自定义节点视图。

*   **`dom`: `DOMNode`**
    表示文档节点的外部 DOM 节点。

*   **`contentDOM`: `HTMLElement`** (可选)
    应包含节点内容的 DOM 节点。

*   **`update`: `fn(node: Node, decorations: readonly Decoration[], innerDecorations: DecorationSource) → boolean`** (可选)
    当视图更新自身时调用。

*   **`selectNode`: `fn()`** (可选)
    当节点被选中时调用。

*   **`deselectNode`: `fn()`** (可选)
    当节点被取消选中时调用。

*   **`setSelection`: `fn(anchor: number, head: number, root: Document | ShadowRoot)`** (可选)
    调用以处理在节点内设置选择。

*   **`stopEvent`: `fn(event: Event) → boolean`** (可选)
    可以用来防止源自节点视图的事件被编辑器处理。

*   **`ignoreMutation`: `fn(mutation: ViewMutationRecord) → boolean`** (可选)
    当视图内发生突变时调用。

*   **`destroy`: `fn()`** (可选)
    当节点视图从编辑器中移除或整个编辑器被销毁时调用。

#### `interface` MarkView

自定义标记视图。

*   **`dom`: `DOMNode`**
    表示文档节点的外部 DOM 节点。

*   **`contentDOM`: `HTMLElement`** (可选)
    应包含标记内容的 DOM 节点。

*   **`ignoreMutation`: `fn(mutation: ViewMutationRecord) → boolean`** (可选)
    当视图内发生突变时调用。

*   **`destroy`: `fn()`** (可选)
    当标记视图被移除时调用。

### Decorations (装饰)

装饰使得可以在不实际更改文档的情况下影响文档的绘制方式。

#### `class` Decoration

*   **`static widget(pos: number, toDOM: fn(view: EditorView, getPos: fn() → number | undefined) → DOMNode | DOMNode, spec?: Object) → Decoration`**
    创建一个小部件装饰，这是一个在文档中给定位置显示的 DOM 节点。

*   **`static inline(from: number, to: number, attrs: DecorationAttrs, spec?: Object) → Decoration`**
    创建一个内联装饰，它将给定的属性添加到给定范围内的每个内联节点。

*   **`static node(from: number, to: number, attrs: DecorationAttrs, spec?: Object) → Decoration`**
    创建一个节点装饰。`from` 和 `to` 应该精确指向 `from` 和 `to` 之间的单个节点。

#### `class` DecorationSet `implements` DecorationSource

装饰的集合，其组织方式使得绘制算法可以有效地使用和比较它们。

*   **`static create(doc: Node, decorations: readonly Decoration[]) → DecorationSet`**
    创建一个包含给定装饰的集合。

*   **`static empty: DecorationSet`**
    空集。

*   **`map(mapping: Mappable, doc: Node, options?: Object) → DecorationSet`**
    映射装饰集。

*   **`add(doc: Node, decorations: readonly Decoration[]) → DecorationSet`**
    向集合添加另一组装饰。

*   **`remove(decorations: readonly Decoration[]) → DecorationSet`**
    从集合中移除给定的装饰列表。

## prosemirror-model 模块

此模块定义了 ProseMirror 的内容模型，即用于表示和处理文档的数据结构。

### Document Structure (文档结构)

ProseMirror 文档是一棵树。在每一层，一个节点描述内容的类型，并保存一个包含其子节点的片段。

#### `class` Node

此类表示构成 ProseMirror 文档的树中的一个节点。

*   **`type`: `NodeType`**
    此节点的类型。

*   **`attrs`: `Attrs`**
    将属性名称映射到值的对象。

*   **`marks`: `readonly Mark[]`**
    应用于此节点的标记。

*   **`content`: `Fragment`**
    保存节点子节点的容器。

*   **`text`: `string | undefined`**
    对于文本节点，这包含节点的文本内容。

*   **`nodeSize`: `number`**
    此节点的大小。

*   **`childCount`: `number`**
    节点拥有的子节点数。

*   **`child(index: number) → Node`**
    获取给定索引处的子节点。

*   **`maybeChild(index: number) → Node | null`**
    获取给定索引处的子节点，如果存在。

*   **`forEach(f: fn(node: Node, offset: number, index: number))`**
    为每个子节点调用 `f`。

*   **`nodesBetween(from: number, to: number, f: fn(node: Node, pos: number, parent: Node | null, index: number) → boolean | undefined, startPos?: number = 0)`**
    递归地为给定两个位置之间的所有后代节点调用回调。

*   **`descendants(f: fn(node: Node, pos: number, parent: Node | null, index: number) → boolean | undefined)`**
    为每个后代节点调用给定的回调。

*   **`textContent`: `string`**
    连接在此片段及其子项中找到的所有文本节点。

*   **`textBetween(from: number, to: number, blockSeparator?: string, leafText?: string | fn(leafNode: Node) → string | null) → string`**
    获取位置 `from` 和 `to` 之间的所有文本。

*   **`firstChild`: `Node | null`**
    返回此节点的第一个子节点。

*   **`lastChild`: `Node | null`**
    返回此节点的最后一个子节点。

*   **`eq(other: Node) → boolean`**
    测试两个节点是否表示相同的文档片段。

*   **`sameMarkup(other: Node) → boolean`**
    比较此节点的标记（类型、属性和标记）与另一个节点的标记。

*   **`copy(content?: Fragment | null = null) → Node`**
    创建一个具有与此节点相同标记的新节点，包含给定的内容。

*   **`mark(marks: readonly Mark[]) → Node`**
    创建此节点的副本，使用给定的标记集。

*   **`cut(from: number, to?: number = this.content.size) → Node`**
    创建此节点的副本，仅包含给定位置之间的内容。

*   **`slice(from: number, to?: number = this.content.size, includeParents?: boolean = false) → Slice`**
    切出给定位置之间的文档部分，并将其作为 `Slice` 对象返回。

*   **`replace(from: number, to: number, slice: Slice) → Node`**
    用给定的切片替换给定位置之间的文档部分。

*   **`nodeAt(pos: number) → Node | null`**
    查找给定位置之后的节点。

*   **`childAfter(pos: number) → {node: Node | null, index: number, offset: number}`**
    查找给定偏移量之后的（直接）子节点。

*   **`childBefore(pos: number) → {node: Node | null, index: number, offset: number}`**
    查找给定偏移量之前的（直接）子节点。

*   **`resolve(pos: number) → ResolvedPos`**
    解析文档中的给定位置。

*   **`isBlock`: `boolean`**
    当这是块（非内联节点）时为 True。

*   **`isTextblock`: `boolean`**
    当这是文本块节点（包含内联内容的块节点）时为 True。

*   **`inlineContent`: `boolean`**
    当此节点允许内联内容时为 True。

*   **`isInline`: `boolean`**
    当这是内联节点时为 True。

*   **`isText`: `boolean`**
    当这是文本节点时为 True。

*   **`isLeaf`: `boolean`**
    当这是叶节点时为 True。

*   **`isAtom`: `boolean`**
    当这是原子节点时为 True。

*   **`toString() → string`**
    返回此节点的字符串表示形式以进行调试。

*   **`toJSON() → any`**
    返回此节点的 JSON 可序列化表示。

*   **`static fromJSON(schema: Schema, json: any) → Node`**
    从其 JSON 表示反序列化节点。

#### `class` Fragment

片段表示节点的子节点集合。

*   **`size`: `number`**
    片段的大小。

*   **`content`: `readonly Node[]`**
    此片段中的子节点。

*   **`append(other: Fragment) → Fragment`**
    创建一个包含此片段和其他片段组合内容的新片段。

*   **`cut(from: number, to?: number = this.size) → Fragment`**
    切出两个给定位置之间的子片段。

*   **`replaceChild(index: number, node: Node) → Fragment`**
    创建一个新片段，其中给定索引处的节点被给定节点替换。

*   **`addToStart(node: Node) → Fragment`**
    通过将给定节点添加到此片段的开头来创建一个新片段。

*   **`addToEnd(node: Node) → Fragment`**
    通过将给定节点追加到此片段来创建一个新片段。

*   **`eq(other: Fragment) → boolean`**
    将此片段与另一个片段进行比较。

*   **`firstChild`: `Node | null`**
    片段的第一个子节点。

*   **`lastChild`: `Node | null`**
    片段的最后一个子节点。

*   **`childCount`: `number`**
    此片段中的子节点数。

*   **`child(index: number) → Node`**
    获取给定索引处的子节点。

*   **`forEach(f: fn(node: Node, offset: number, index: number))`**
    为每个子节点调用 `f`。

*   **`toJSON() → any`**
    创建此片段的 JSON 可序列化表示。

*   **`static fromJSON(schema: Schema, value: any) → Fragment`**
    从其 JSON 表示反序列化片段。

*   **`static fromArray(array: readonly Node[]) → Fragment`**
    从节点数组构建片段。

*   **`static from(nodes?: Fragment | Node | readonly Node[] | null) → Fragment`**
    从可以解释为一组节点的内容创建片段。

*   **`static empty: Fragment`**
    一个空片段。

#### `class` Mark

标记是可以附加到节点的一条信息，例如它是强调的、代码字体的还是链接的一部分。

*   **`type`: `MarkType`**
    此标记的类型。

*   **`attrs`: `Attrs`**
    与此标记关联的属性。

*   **`addToSet(set: readonly Mark[]) → readonly Mark[]`**
    给定一组标记，创建一个包含此标记的新集合。

*   **`removeFromSet(set: readonly Mark[]) → readonly Mark[]`**
    从给定集合中移除此标记。

*   **`isInSet(set: readonly Mark[]) → boolean`**
    测试此标记是否在给定的标记集中。

*   **`eq(other: Mark) → boolean`**
    测试此标记是否与另一个标记具有相同的类型和属性。

*   **`toJSON() → any`**
    将此标记转换为 JSON 可序列化表示。

*   **`static fromJSON(schema: Schema, json: any) → Mark`**
    从 JSON 反序列化标记。

*   **`static none: readonly Mark[]`**
    空标记集。

#### `class` Slice

切片表示从较大文档中切出的一块。

*   **`new Slice(content: Fragment, openStart: number, openEnd: number)`**
    创建切片。

*   **`content`: `Fragment`**
    切片的内容。

*   **`openStart`: `number`**
    片段开始处的开放深度。

*   **`openEnd`: `number`**
    末尾的开放深度。

*   **`size`: `number`**
    此切片插入文档时将增加的大小。

*   **`toJSON() → any`**
    将切片转换为 JSON 可序列化表示。

*   **`static fromJSON(schema: Schema, json: any) → Slice`**
    从其 JSON 表示反序列化切片。

*   **`static empty: Slice`**
    空切片。

### Resolved Positions (解析位置)

您可以解析位置以获取有关它的更多信息。

#### `class` ResolvedPos

*   **`depth`: `number`**
    父节点距根节点的层级数。

*   **`pos`: `number`**
    被解析的位置。

*   **`parentOffset`: `number`**
    此位置在其父节点中的偏移量。

*   **`parent`: `Node`**
    位置指向的父节点。

*   **`doc`: `Node`**
    解析位置的根节点。

*   **`node(depth?: number) → Node`**
    给定级别的祖先节点。

*   **`index(depth?: number) → number`**
    给定级别的祖先中的索引。

*   **`indexAfter(depth?: number) → number`**
    指向给定级别祖先中此位置之后的索引。

*   **`start(depth?: number) → number`**
    给定级别节点开始处的（绝对）位置。

*   **`end(depth?: number) → number`**
    给定级别节点结束处的（绝对）位置。

*   **`before(depth?: number) → number`**
    给定级别包装节点之前的（绝对）位置。

*   **`after(depth?: number) → number`**
    给定级别包装节点之后的（绝对）位置。

*   **`textOffset`: `number`**
    当此位置指向文本节点时，返回位置与文本节点开始之间的距离。

*   **`nodeAfter`: `Node | null`**
    获取位置之后的直接节点（如果有）。

*   **`nodeBefore`: `Node | null`**
    获取位置之前的直接节点（如果有）。

*   **`marks() → readonly Mark[]`**
    获取此位置的标记。

*   **`sharedDepth(pos: number) → number`**
    此位置与给定位置共享的深度。

*   **`blockRange(other?: ResolvedPos = this, pred?: fn(node: Node) → boolean) → NodeRange | null`**
    返回基于此位置和给定位置在块内容周围发散的位置的范围。

*   **`sameParent(other: ResolvedPos) → boolean`**
    查询给定位置是否共享相同的父节点。

*   **`max(other: ResolvedPos) → ResolvedPos`**
    返回此位置和给定位置中较大的一个。

*   **`min(other: ResolvedPos) → ResolvedPos`**
    返回此位置和给定位置中较小的一个。

#### `class` NodeRange

表示内容的平面范围，即在同一节点中开始和结束的范围。

*   **`new NodeRange($from: ResolvedPos, $to: ResolvedPos, depth: number)`**
    构造节点范围。

*   **`$from`: `ResolvedPos`**
    沿内容开始的解析位置。

*   **`$to`: `ResolvedPos`**
    沿内容结束的位置。

*   **`depth`: `number`**
    此范围指向的节点的深度。

*   **`start`: `number`**
    范围开始处的位置。

*   **`end`: `number`**
    范围结束处的位置。

*   **`parent`: `Node`**
    范围指向的父节点。

*   **`startIndex`: `number`**
    父节点中范围的起始索引。

*   **`endIndex`: `number`**
    父节点中范围的结束索引。

### Document Schema (文档架构)

每个 ProseMirror 文档都符合一个架构，该架构描述了它由哪些节点和标记组成，以及它们之间的关系。

#### `class` Schema`<Nodes extends string = any, Marks extends string = any>`

文档架构。

*   **`new Schema(spec: SchemaSpec<Nodes, Marks>)`**
    从架构规范构造架构。

*   **`spec`: `SchemaSpec<Nodes, Marks>`**
    架构所基于的规范。

*   **`nodes`: `Object<NodeType>`**
    将架构的节点名称映射到节点类型对象的对象。

*   **`marks`: `Object<MarkType>`**
    将标记名称映射到标记类型对象的对象。

*   **`topNodeType`: `NodeType`**
    此架构的默认顶级节点的类型。

*   **`cached`: `Object<any>`**
    用于存储与此架构相关的计算信息的对象。

*   **`node(type: string | NodeType, attrs?: Attrs | null = null, content?: Fragment | Node | readonly Node[], marks?: readonly Mark[]) → Node`**
    在此架构中创建一个节点。

*   **`text(text: string, marks?: readonly Mark[]) → Node`**
    在架构中创建一个文本节点。

*   **`mark(type: string | MarkType, attrs?: Attrs) → Mark`**
    创建具有给定类型和属性的标记。

*   **`nodeFromJSON(json: any) → Node`**
    从其 JSON 表示反序列化节点。

*   **`markFromJSON(json: any) → Mark`**
    从其 JSON 表示反序列化标记。

#### `interface` SchemaSpec`<Nodes extends string = any, Marks extends string = any>`

描述架构的对象。

*   **`nodes`: `Object<NodeSpec> | OrderedMap<NodeSpec>`**
    此架构中的节点类型。

*   **`marks`: `Object<MarkSpec> | OrderedMap<MarkSpec>`** (可选)
    此架构中存在的标记类型。

*   **`topNode`: `string`** (可选)
    架构的默认顶级节点的名称。默认为 `"doc"`。

#### `interface` NodeSpec

节点类型的描述。

*   **`content`: `string`** (可选)
    此节点的内容表达式。

*   **`marks`: `string`** (可选)
    此节点内允许的标记。

*   **`group`: `string`** (可选)
    此节点所属的组。

*   **`inline`: `boolean`** (可选)
    对于内联节点应设置为 true。

*   **`atom`: `boolean`** (可选)
    可以设置为 true 以指示虽然这不是叶节点，但它没有直接可编辑的内容。

*   **`attrs`: `Object<AttributeSpec>`** (可选)
    此类型节点获得的属性。

*   **`selectable`: `boolean`** (可选)
    控制此类型的节点是否可以作为节点选择被选中。

*   **`draggable`: `boolean`** (可选)
    确定此类型的节点是否可以在不被选中的情况下被拖动。

*   **`code`: `boolean`** (可选)
    可用于指示此节点包含代码。

*   **`whitespace`: `"pre" | "normal"`** (可选)
    控制解析此节点中空白的方式。

*   **`defining`: `boolean`** (可选)
    启用时，在替换操作（如粘贴）期间，此节点被视为重要的父节点。

*   **`isolating`: `boolean`** (可选)
    启用时，此类型节点的侧面算作常规编辑操作不会跨越的边界。

*   **`toDOM`: `fn(node: Node) → DOMOutputSpec`** (可选)
    定义此类型节点序列化为 DOM/HTML 的默认方式。

*   **`parseDOM`: `readonly TagParseRule[]`** (可选)
    将 DOM 解析器信息与此节点关联。

#### `interface` MarkSpec

*   **`attrs`: `Object<AttributeSpec>`** (可选)
    此标记的属性。

*   **`inclusive`: `boolean`** (可选)
    标记是否应在光标放置在其末尾时处于活动状态。

*   **`excludes`: `string`** (可选)
    确定此标记不能与哪些其他标记共存。

*   **`group`: `string`** (可选)
    此标记所属的组。

*   **`spanning`: `boolean`** (可选)
    确定此标记是否可以跨越多个节点。

*   **`toDOM`: `fn(mark: Mark, inline: boolean) → DOMOutputSpec`** (可选)
    定义此类型标记序列化为 DOM/HTML 的默认方式。

*   **`parseDOM`: `readonly ParseRule[]`** (可选)
    将 DOM 解析器信息与此标记关联。

#### `class` NodeType

节点类型是每个 `Schema` 分配一次的对象，用于标记 `Node` 实例。

*   **`name`: `string`**
    节点类型在此架构中的名称。

*   **`schema`: `Schema`**
    节点类型所属的 `Schema`。

*   **`spec`: `NodeSpec`**
    此类型基于的规范。

*   **`isBlock`: `boolean`**
    如果这是块类型，则为 True。

*   **`isText`: `boolean`**
    如果这是文本节点类型，则为 True。

*   **`isInline`: `boolean`**
    如果这是内联类型，则为 True。

*   **`create(attrs?: Attrs | null = null, content?: Fragment | Node | readonly Node[] | null, marks?: readonly Mark[]) → Node`**
    创建此类型的 `Node`。

*   **`createChecked(attrs?: Attrs | null = null, content?: Fragment | Node | readonly Node[] | null, marks?: readonly Mark[]) → Node`**
    像 create 一样，但根据节点类型的内容限制检查给定的内容。

*   **`createAndFill(attrs?: Attrs | null = null, content?: Fragment | Node | readonly Node[] | null, marks?: readonly Mark[]) → Node | null`**
    像 create 一样，但查看是否需要向给定片段的开头或结尾添加节点以使其适合该节点。

*   **`validContent(content: Fragment) → boolean`**
    如果给定片段是此节点类型的有效内容，则返回 true。

#### `class` MarkType

*   **`name`: `string`**
    标记类型的名称。

*   **`schema`: `Schema`**
    此标记类型实例所属的架构。

*   **`create(attrs?: Attrs | null = null) → Mark`**
    创建此类型的标记。

### DOM Representation (DOM 表示)

#### `class` DOMParser

DOM 解析器表示将 DOM 内容解析为符合给定架构的 ProseMirror 文档的策略。

*   **`new DOMParser(schema: Schema, rules: readonly ParseRule[])`**
    创建针对给定架构的解析器。

*   **`parse(dom: DOMNode, options?: ParseOptions = {}) → Node`**
    从 DOM 节点的内容解析文档。

*   **`parseSlice(dom: DOMNode, options?: ParseOptions = {}) → Slice`**
    解析给定 DOM 节点的内容，返回一个切片。

*   **`static fromSchema(schema: Schema) → DOMParser`**
    使用架构节点规范中列出的解析规则构造 DOM 解析器。

#### `interface` ParseOptions

*   **`preserveWhitespace`: `boolean | "full"`** (可选)
    默认情况下，空白按 HTML 规则折叠。传递 `true` 以保留空白。

*   **`findPositions`: `{node: DOMNode, offset: number, pos?: number}[]`** (可选)
    当给出时，解析器将记录给定 DOM 位置的文档位置。

*   **`from`: `number`** (可选)
    开始解析的子节点索引。

*   **`to`: `number`** (可选)
    停止解析的子节点索引。

*   **`topNode`: `Node`** (可选)
    默认情况下，内容被解析为架构的默认顶级节点类型。您可以传递此选项以使用不同节点作为顶级容器。

#### `class` DOMSerializer

*   **`serializeFragment(fragment: Fragment, options?: Object = {}, target?: HTMLElement | DocumentFragment) → HTMLElement | DocumentFragment`**
    将此片段的内容序列化为 DOM 片段。

*   **`serializeNode(node: Node, options?: Object = {}) → DOMNode`**
    将此节点序列化为 DOM 节点。

*   **`static fromSchema(schema: Schema) → DOMSerializer`**
    使用架构节点/标记规范中列出的 `toDOM` 方法构建序列化器。

## prosemirror-transform 模块

此模块定义了一种修改文档的方法，允许记录、重放和重新排序更改。

### Steps (步骤)

转换发生在 `Step` 中，这是对文档的原子、定义明确的修改。

#### `abstract class` Step

*   **`apply(doc: Node) → StepResult`**
    将此步骤应用于给定文档。

*   **`getMap() → StepMap`**
    获取表示此步骤引起的更改的步骤映射。

*   **`invert(doc: Node) → Step`**
    创建一个逆转此步骤效果的步骤。

*   **`map(mapping: Mappable) → Step | null`**
    通过给定的映射映射此步骤。

*   **`toJSON() → any`**
    创建此步骤的 JSON 可序列化表示。

*   **`static fromJSON(schema: Schema, json: any) → Step`**
    从 JSON 反序列化步骤。

#### `class` StepResult

应用步骤的结果。

*   **`doc`: `Node | null`**
    转换后的文档，如果成功。

*   **`failed`: `string | null`**
    失败消息，如果不成功。

#### `class` ReplaceStep `extends` Step

用新内容的切片替换文档的一部分。

#### `class` ReplaceAroundStep `extends` Step

用内容的切片替换文档的一部分，但通过将其移动到切片中来保留替换内容的一个范围。

#### `class` AddMarkStep `extends` Step

向给定范围添加标记。

#### `class` RemoveMarkStep `extends` Step

从给定范围移除标记。

### Position Mapping (位置映射)

#### `interface` Mappable

*   **`map(pos: number, assoc?: number) → number`**
    通过此对象映射位置。

*   **`mapResult(pos: number, assoc?: number) → MapResult`**
    映射位置，并返回包含有关映射的额外信息的对象。

#### `class` MapResult

*   **`pos`: `number`**
    位置的映射版本。

*   **`deleted`: `boolean`**
    告诉您位置是否被删除。

#### `class` Mapping `implements` Mappable

映射表示零个或多个步骤映射的管道。

*   **`map(pos: number, assoc?: number) → number`**
    通过此映射中的映射映射位置。

*   **`appendMap(map: StepMap, mirrors?: number)`**
    将步骤映射添加到此映射的末尾。

*   **`invert() → Mapping`**
    创建此映射的反向映射。

### Document transforms (文档转换)

#### `class` Transform

构建和跟踪表示文档转换的步骤数组的抽象。

*   **`new Transform(doc: Node)`**
    创建一个从给定文档开始的转换。

*   **`steps`: `Step[]`**
    此转换中的步骤。

*   **`doc`: `Node`**
    当前文档（应用转换中步骤的结果）。

*   **`step(step: Step) → Transform`**
    在此转换中应用新步骤。

*   **`replace(from: number, to?: number = from, slice?: Slice = Slice.empty) → Transform`**
    用给定的 `slice` 替换 `from` 和 `to` 之间的文档部分。

*   **`replaceWith(from: number, to: number, content: Fragment | Node | readonly Node[]) → Transform`**
    用给定的内容替换给定范围。

*   **`delete(from: number, to: number) → Transform`**
    删除给定位置之间的内容。

*   **`insert(pos: number, content: Fragment | Node | readonly Node[]) → Transform`**
    在给定位置插入给定内容。

*   **`lift(range: NodeRange, target: number) → Transform`**
    将给定范围内的内容从其父节点中拆分出来。

*   **`setBlockType(from: number, to?: number = from, type: NodeType, attrs?: Attrs | null = null) → Transform`**
    设置给定范围内所有文本块的块类型。

*   **`setNodeMarkup(pos: number, type?: NodeType, attrs?: Attrs | null = null, marks?: readonly Mark[]) → Transform`**
    更改 `pos` 处节点的类型、属性和/或标记。

*   **`addMark(from: number, to: number, mark: Mark) → Transform`**
    将给定标记添加到 `from` 和 `to` 之间的内联内容。

*   **`removeMark(from: number, to: number, mark?: Mark | MarkType | null) → Transform`**
    从给定范围移除标记。

## prosemirror-commands 模块

此模块导出许多命令，这些命令是封装编辑操作的构建块函数。

*   **`chainCommands(...commands: readonly Command[]) → Command`**
    将多个命令函数组合成一个函数。

*   **`deleteSelection`: `Command`**
    删除选择，如果有的话。

*   **`joinBackward`: `Command`**
    如果选择为空且位于文本块的开头，尝试将该块与之前的块连接。

*   **`joinForward`: `Command`**
    如果选择为空且位于文本块的末尾，尝试将该块与之后的块连接。

*   **`joinUp`: `Command`**
    将选定的块或最近的可连接祖先与上面的兄弟节点连接。

*   **`joinDown`: `Command`**
    将选定的块或最近的可连接祖先与下面的兄弟节点连接。

*   **`lift`: `Command`**
    将选定的块或最近的可提升祖先块从其父节点中提升出来。

*   **`newlineInCode`: `Command`**
    如果选择在代码块中，则插入换行符。

*   **`exitCode`: `Command`**
    当选择在代码块中时，在代码块后创建一个默认块，并将光标移动到那里。

*   **`createParagraphNear`: `Command`**
    如果选择了块节点，则在其之前或之后创建一个空段落。

*   **`liftEmptyBlock`: `Command`**
    如果光标在可提升的空文本块中，则提升该块。

*   **`splitBlock`: `Command`**
    拆分选择的父块。

*   **`splitBlockKeepMarks`: `Command`**
    像 splitBlock 一样，但不重置光标处的活动标记集。

*   **`selectParentNode`: `Command`**
    将选择移动到包装当前选择的节点。

*   **`selectAll`: `Command`**
    全选文档。

*   **`wrapIn(nodeType: NodeType, attrs?: Attrs | null = null) → Command`**
    将选择包装在具有给定属性的给定类型的节点中。

*   **`setBlockType(nodeType: NodeType, attrs?: Attrs | null = null) → Command`**
    返回一个命令，该命令尝试将选择周围的选定文本块设置为给定的节点类型。

*   **`toggleMark(markType: MarkType, attrs?: Attrs | null = null) → Command`**
    创建一个命令，用于切换具有给定属性的给定标记。

*   **`baseKeymap`: `Object<Command>`**
    基本键绑定。

## prosemirror-history 模块

ProseMirror 的撤消/重做历史记录的实现。

*   **`history(config?: Object = {}) → Plugin`**
    返回一个为编辑器启用撤消历史记录的插件。

*   **`undo`: `Command`**
    撤消上次更改的命令函数。

*   **`redo`: `Command`**
    重做上次撤消的更改的命令函数。

## prosemirror-collab 模块

此模块实现了一个 API，可以将协作编辑的通信通道挂钩到该 API 中。

*   **`collab(config?: Object = {}) → Plugin`**
    创建一个启用编辑器协作编辑框架的插件。
    *   **`config`**
        *   **`version`: `number`** (可选) 协作编辑的起始版本号。
        *   **`clientID`: `number | string`** (可选) 此客户端的唯一 ID。

*   **`receiveTransaction(state: EditorState, steps: readonly Step[], clientIDs: readonly (string | number)[], options?: Object = {}) → Transaction`**
    创建一个事务，该事务应用来自其他客户端的一组步骤。

*   **`sendableSteps(state: EditorState) → {version: number, steps: readonly Step[], clientID: string | number, origin: Transaction} | null`**
    提供自上次发送以来此客户端所做的步骤。

## prosemirror-inputrules 模块

此模块定义了一个用于将输入规则附加到编辑器的插件，该插件可以对用户键入的文本做出反应或进行转换。

#### `class` InputRule

输入规则是描述一段文本的正则表达式，当键入该文本时，会触发某些操作。

*   **`new InputRule(match: RegExp, handler: string | fn(state: EditorState, match: RegExpMatchArray, start: number, end: number) → Transaction | null, options?: Object = {})`**
    创建一个新的输入规则。

*   **`inputRules(config: {rules: readonly InputRule[]}) → Plugin`**
    创建一个插件，用于应用给定的输入规则数组。

*   **`undoInputRule`: `Command`**
    如果最后一次事务是输入规则的结果，此命令将撤消该输入规则。

## prosemirror-schema-basic 模块

此模块定义了一个简单的架构。

*   **`schema`: `Schema`**
    此架构大致对应于 [CommonMark](http://commonmark.org/) 使用的文档架构。

*   **`nodes`: `Object`**
    此架构中定义的节点的规范（doc, paragraph, blockquote, horizontal_rule, heading, code_block, text, image, hard_break）。

*   **`marks`: `Object`**
    架构中标记的规范（link, em, strong, code）。

## prosemirror-schema-list 模块

此模块导出列表相关的架构元素和命令。

*   **`orderedList`: `NodeSpec`**
    有序列表节点规范。

*   **`bulletList`: `NodeSpec`**
    无序列表节点规范。

*   **`listItem`: `NodeSpec`**
    列表项规范。

*   **`addListNodes(nodes: OrderedMap<NodeSpec>, itemContent: string, listGroup?: string) → OrderedMap<NodeSpec>`**
    将列表节点添加到给定的一组节点以创建新集。

*   **`wrapInList(listType: NodeType, attrs?: Attrs | null = null) → Command`**
    返回一个命令函数，该函数将选择包装在具有给定类型和属性的列表中。

*   **`splitListItem(itemType: NodeType) → Command`**
    构建一个命令，通过拆分列表项来拆分列表项顶层的非空文本块。

*   **`liftListItem(itemType: NodeType) → Command`**
    创建一个命令，将选择周围的列表项提升到包装列表中。

*   **`sinkListItem(itemType: NodeType) → Command`**
    创建一个命令，将选择周围的列表项下沉到内部列表中。
