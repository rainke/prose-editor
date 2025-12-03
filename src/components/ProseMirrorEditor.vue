<script setup>
import { onMounted, ref, onBeforeUnmount } from 'vue'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { Schema, DOMParser } from 'prosemirror-model'
import { schema as basicSchema } from 'prosemirror-schema-basic'
import { addListNodes } from 'prosemirror-schema-list'
import { exampleSetup } from 'prosemirror-example-setup'

// 编辑器容器引用
const editorRef = ref(null)
const contentRef = ref(null)

// EditorView 实例
let view = null

/**
 * 1. Schema（文档模型）
 * 
 * Schema 定义了编辑器中可以存在的节点类型和标记类型
 * - nodes: 块级元素（如段落、标题、列表等）
 * - marks: 行内样式（如加粗、斜体、链接等）
 * 
 * 这里我们使用 prosemirror-schema-basic 提供的基础 schema，
 * 并通过 addListNodes 添加列表支持
 */
const mySchema = new Schema({
  // 从基础 schema 继承节点，并添加列表节点
  nodes: addListNodes(basicSchema.spec.nodes, 'paragraph block*', 'block'),
  // 直接使用基础 schema 的标记（加粗、斜体、链接、代码）
  marks: basicSchema.spec.marks
})

onMounted(() => {
  /**
   * 2. EditorState（编辑器状态）
   * 
   * EditorState 是一个不可变的数据结构，包含：
   * - doc: 当前文档内容
   * - selection: 当前选区
   * - plugins: 插件列表（处理键盘事件、历史记录等）
   */
  const state = EditorState.create({
    // 从 HTML 内容初始化文档
    doc: DOMParser.fromSchema(mySchema).parse(contentRef.value),
    // exampleSetup 提供了一组常用插件：
    // - 键盘快捷键（Ctrl+B 加粗，Ctrl+I 斜体等）
    // - 输入规则（输入 # 自动变成标题）
    // - 菜单栏
    // - 历史记录（撤销/重做）
    plugins: exampleSetup({ schema: mySchema })
  })

  /**
   * 3. EditorView（编辑器视图）
   * 
   * EditorView 负责：
   * - 将 EditorState 渲染成 DOM
   * - 处理用户输入并更新状态
   * - dispatchTransaction: 当状态改变时的回调
   */
  view = new EditorView(editorRef.value, {
    state,
    // 每当状态改变时，这个函数会被调用
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
    <h2>🎯 ProseMirror 入门示例</h2>
    
    <!-- 初始内容（会被解析为 ProseMirror 文档） -->
    <div ref="contentRef" style="display: none">
      <h1>欢迎使用 ProseMirror！</h1>
      <p>这是一个<strong>功能强大</strong>的富文本编辑器框架。</p>
      <p>试试以下操作：</p>
      <ul>
        <li><strong>Ctrl/Cmd + B</strong> - 加粗</li>
        <li><strong>Ctrl/Cmd + I</strong> - 斜体</li>
        <li><strong>Ctrl/Cmd + Z</strong> - 撤销</li>
        <li><strong>Ctrl/Cmd + Y</strong> - 重做</li>
        <li>输入 <code>#</code> + 空格 - 创建标题</li>
        <li>输入 <code>*</code> 或 <code>-</code> + 空格 - 创建列表</li>
      </ul>
      <p>打开浏览器控制台查看文档变化的日志 📋</p>
    </div>
    
    <!-- 编辑器挂载点 -->
    <div ref="editorRef" class="editor"></div>
    
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

.editor :deep(.ProseMirror) p {
  margin: 0.5em 0;
}

.editor :deep(.ProseMirror) h1,
.editor :deep(.ProseMirror) h2,
.editor :deep(.ProseMirror) h3 {
  margin: 1em 0 0.5em;
}

.editor :deep(.ProseMirror) ul,
.editor :deep(.ProseMirror) ol {
  padding-left: 1.5em;
}

.editor :deep(.ProseMirror) code {
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}

/* 菜单栏样式 */
.editor :deep(.ProseMirror-menubar) {
  border-bottom: 1px solid #e0e0e0;
  padding: 4px 8px;
  background: #fafafa;
  border-radius: 6px 6px 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  align-items: center;
  position: relative !important;
  top: auto !important;
}

.editor :deep(.ProseMirror-menubar-wrapper) {
  border-radius: 8px;
  overflow: hidden;
}

/* 修复菜单栏高度不断增长的问题 */
.editor :deep(.ProseMirror-menubar-wrapper),
.editor :deep(.ProseMirror-menubar) {
  min-height: auto !important;
}

/* 菜单项样式 */
.editor :deep(.ProseMirror-menu) {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  align-items: center;
}

.editor :deep(.ProseMirror-menuitem) {
  margin: 0 !important;
}

.editor :deep(.ProseMirror-icon) {
  padding: 4px 6px;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.editor :deep(.ProseMirror-icon:hover) {
  background: #e8e8e8;
}

.editor :deep(.ProseMirror-icon svg) {
  width: 16px;
  height: 16px;
}

/* 下拉菜单样式 */
.editor :deep(.ProseMirror-menu-dropdown) {
  padding: 4px 8px;
  font-size: 13px;
  border-radius: 4px;
}

.editor :deep(.ProseMirror-menu-dropdown:hover) {
  background: #e8e8e8;
}

.editor :deep(.ProseMirror-menu-dropdown-wrap) {
  position: relative;
}

.editor :deep(.ProseMirror-menu-dropdown-menu) {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 4px;
  min-width: 120px;
}

.editor :deep(.ProseMirror-menu-dropdown-item) {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
}

.editor :deep(.ProseMirror-menu-dropdown-item:hover) {
  background: #f0f0f0;
}

/* 分隔符样式 */
.editor :deep(.ProseMirror-menuseparator) {
  width: 1px;
  height: 20px;
  background: #ddd;
  margin: 0 4px;
}

.tips {
  margin-top: 2rem;
  padding: 1.5rem;
  background: rgba(100, 108, 255, 0.1);
  border-radius: 8px;
}

.tips h3 {
  margin: 0 0 1rem;
  text-align: center;
}

.concept-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.concept {
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 6px;
}

.concept h4 {
  margin: 0 0 0.5rem;
  color: #646cff;
}

.concept p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

@media (max-width: 600px) {
  .concept-grid {
    grid-template-columns: 1fr;
  }
}
</style>
