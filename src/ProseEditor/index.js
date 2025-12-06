import { EditorView } from 'prosemirror-view';
import { EditorState } from 'prosemirror-state';
import { Schema, DOMParser } from 'prosemirror-model';
import { defaultMarkdownParser, defaultMarkdownSerializer } from 'prosemirror-markdown';
import { exampleSetup } from 'prosemirror-example-setup';
import 'prosemirror-view/style/prosemirror.css';
import { purplePlugin } from './plugins/purple';
import { schema } from './schema';
import 'katex/dist/katex.min.css';

export const createEditor = (dom, { markdown, onStateChange }) => {
  const state = EditorState.create({
    doc: schema.node('doc', null, [
      schema.node('paragraph', null, [schema.text('paragraph')]),
      schema.node('horizontal_rule'),
      schema.node('paragraph', null, [
        schema.text('公式: '),
        schema.node('math_inline', { value: 'x^2' }),
      ]),
      schema.node('math_block', { value: '\\frac{a}{b} = c' }),
    ]),
    plugins: [],
  });
  let view = new EditorView(dom, {
    state,
    dispatchTransaction(transaction) {
      console.log('📝 文档变化:', transaction);
      // 应用事务，获得新状态
      const newState = view.state.apply(transaction);
      // 更新视图
      view.updateState(newState);
      newState.view = view;
      onStateChange?.(newState);
    },
  });
  window.view = view;
  return view;
};
