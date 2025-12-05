import { EditorState } from 'prosemirror-state'
import { Schema, DOMParser } from 'prosemirror-model'
import { schema as basicSchema } from 'prosemirror-schema-basic'
import { addListNodes } from 'prosemirror-schema-list'

const schema = new Schema({
  // 从基础 schema 继承节点，并添加列表节点
  nodes: addListNodes(basicSchema.spec.nodes, 'paragraph block*', 'block'),
  // 直接使用基础 schema 的标记（加粗、斜体、链接、代码）
  marks: basicSchema.spec.marks
})