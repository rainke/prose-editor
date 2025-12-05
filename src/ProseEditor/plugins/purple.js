import { Plugin } from "prosemirror-state"
import { Decoration, DecorationSet } from "prosemirror-view"

export let purplePlugin = new Plugin({
  props: {
    decorations(state) {
      return DecorationSet.create(state.doc, [
        Decoration.widget(1, () => {
          let span = document.createElement("span")
          span.style.color = "red"
          span.style.textDecoration = "line-through"
          span.textContent = "这里不可编辑"
          return span
        }),
        Decoration.inline(0, state.doc.content.size, {style: "color: purple"}),
        Decoration.inline(4, 8, {style: "background: yellow"}),
      ])
    }
  }
})