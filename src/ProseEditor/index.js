import { EditorView } from "prosemirror-view"
import { EditorState } from 'prosemirror-state'
import { Schema, DOMParser } from 'prosemirror-model'
import { schema, defaultMarkdownParser, defaultMarkdownSerializer } from "prosemirror-markdown"
import { exampleSetup } from 'prosemirror-example-setup'
import 'prosemirror-view/style/prosemirror.css'

let doc = schema.node("doc", null, [
  schema.node("paragraph", null, [schema.text("One.")]),
  schema.node("paragraph", null, [schema.text("Two!")])
])

console.log(doc.content.size, doc.nodeSize)


export const createEditor = (dom, markdown) => {
  const state =  EditorState.create({
    doc: defaultMarkdownParser.parse(markdown),
    plugins: exampleSetup({ schema })
  })
  let view = new EditorView(dom, {
    state,
    dispatchTransaction(transaction) {
      console.log(
        '📝 文档变化:',
        'docChanged:', transaction.docChanged,
        'steps:', transaction.steps.length
      )
      // 应用事务，获得新状态
      const newState = view.state.apply(transaction)
      // 更新视图
      view.updateState(newState)
    }
  })
  window.view = view
  return view
}