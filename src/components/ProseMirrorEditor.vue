<script setup>
import { onMounted, ref, useTemplateRef, onBeforeUnmount } from 'vue'
import 'prosemirror-menu/style/menu.css'
import { createEditor } from '../ProseEditor'

// 编辑器容器引用
const editorRef = useTemplateRef('editor')

/** @type { import('prosemirror-view').EditorView } */
let view = null


onMounted(() => {
  try {

    view = createEditor(editorRef.value,
`# Welcome to ProseMirror!

This is a **powerful** rich text editor *framework*.

Try the following operations:

- **Ctrl/Cmd + B** - Bold
- **Ctrl/Cmd + I** - Italic
- **Ctrl/Cmd + Z** - Undo
- **Ctrl/Cmd + Y** - Redo
- Type \`#\` + space - Create heading
- Type \`*\` or \`-\` + space - Create list
Open the browser console to see document change logs 📋
`)
  } catch (error) {
    console.error('Failed to initialize ProseMirror Editor:', error)
  }
  console.log('ProseMirror Editor initialized:', view)
})

onBeforeUnmount(() => {
  // 清理 EditorView
  if (view) {
    view.destroy()
  }
})
</script>

<template>
  <div class="editor-wrapper">
    <div ref="editor" class="editor"></div>
    
    <div class="tips">
      <h3>💡 核心概念</h3>
      <div class="concept-grid">
        <div class="concept">
          <h4>Schema</h4>
          <p>定义文档可以包含哪些节点和标记</p>
        </div>
        <div class="concept">
          <h4>State</h4>
          <p>不可变的编辑器状态（文档+选区+插件）</p>
        </div>
        <div class="concept">
          <h4>View</h4>
          <p>负责渲染和处理用户输入</p>
        </div>
        <div class="concept">
          <h4>Transaction</h4>
          <p>描述状态变化的对象</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.editor-wrapper {
  max-width: 800px;
  margin: 0 auto;
  text-align: left;
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
}

.editor {
  background: white;
  color: #333;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  min-height: 200px;
}

/* ProseMirror 编辑器样式 */
.editor :deep(.ProseMirror) {
  padding: 16px;
  min-height: 200px;
  outline: none;
}
</style>
