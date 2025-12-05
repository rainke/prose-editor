import { createInjectionState } from '@vueuse/core';
import { reactive, shallowRef } from 'vue';

export const [useProvideEditorContext, useInjectEditorContext] = createInjectionState(() => {
  /** @type { import('vue').ShallowRef<import('prosemirror-state').EditorState | null> } */
  const state = shallowRef(null)
  /** @type { import('vue').ShallowRef<import('prosemirror-view').EditorView | null> } */
  const view = shallowRef(null)
  function updateState(newState) {
    state.value = newState
  }
  function setView(newView) {
    view.value = newView
    updateState(newView.state)
  }
  const context = {
    view,
    state,
    updateState,
    setView
  };
  return context;
});
