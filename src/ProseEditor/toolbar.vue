<script setup>
import { computed } from 'vue';
import { useInjectEditorContext } from './useEditorState'
import { toggleMark } from 'prosemirror-commands'

const ctx = useInjectEditorContext()

const menuitems = computed(() => {
  const state = ctx.state.value
  if (!state) return []
  const { schema } = state
  const items = []
  const markActive = (mark) => {
    const { from, $from, to, empty } = state.selection
    if (empty) {
      return !!mark.isInSet(state.storedMarks || $from.marks())
    } else {
      return state.doc.rangeHasMark(from, to, mark)
    }
  }
  if (schema.marks.strong) {
    items.push({ name: 'Bold', command: toggleMark(schema.marks.strong), icon: 'B', active: markActive(schema.marks.strong) })
  }
  if (schema.marks.em) {
    items.push({ name: 'Italic', command: toggleMark(schema.marks.em), icon: 'I', active: markActive(schema.marks.em) })
  }
  if (schema.nodes.heading) {
    items.push({ name: 'Heading', icon: 'H' })
  }
  if (schema.nodes.bullet_list) {
    items.push({ name: 'Bullet List', icon: '•' })
  }
  return items
})

function executeCommand(item, e) {
  const state = ctx.state.value
  if (!state) return
  const view = ctx.view.value
  if (!view) return
  item.command(state, view.dispatch, view, e)
}

</script>
<template>
  <div>
    <button
      v-for="item in menuitems"
      :key="item.name"
      @click="executeCommand(item, $event)"
      :title="item.name"
    >
      {{ item.icon }}
    </button>
  </div>
</template>
<style lang="scss" scoped>

</style>