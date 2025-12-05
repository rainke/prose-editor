<script setup>
import Editor from './ProseMirrorEditor.vue'
import Toolbar from './toolbar.vue';
import { useProvideEditorContext } from './useEditorState'

useProvideEditorContext()

</script>
<template>
  <Toolbar />
  <Editor />
</template>
<style lang="scss" scoped>

</style>