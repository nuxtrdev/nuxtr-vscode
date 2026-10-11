/** Verify Nuxt wrapping preserves selected code and respects Vue template, indentation and newline boundaries. */
import { expect, test } from 'vitest';
import { templateSelection, wrapSelection } from '../../src/core/wrap';
test('wraps literal inline text and adds an editable NuxtLink target', () => {
    const source = '<template><span>${literal} $1 \\text</span></template>';
    const start = source.indexOf('<span>'); const end = source.indexOf('</template>');
    expect(wrapSelection(source, start, end, 'NuxtLink', '  ', '\n')).toBe('<NuxtLink to="/"><span>${literal} $1 \\text</span></NuxtLink>');
});
test('indents multiline selections with spaces and retains relative indentation and blank lines', () => {
    const source = '<template>\n  <div>\n    hello\n\n  </div>\n</template>';
    const start = source.indexOf('<div>'); const end = source.indexOf('</div>') + 6;
    expect(wrapSelection(source, start, end, 'ClientOnly', '  ', '\n')).toBe('<ClientOnly>\n    <div>\n      hello\n\n    </div>\n  </ClientOnly>');
});
test('preserves full-line selections, trailing newline, tabs and CRLF', () => {
    const source = '<template>\r\n\t<div>\r\n\t\ttext\r\n\t</div>\r\n</template>';
    const start = source.indexOf('\t<div>'); const end = source.indexOf('</template>');
    expect(wrapSelection(source, start, end, 'DevOnly', '\t', '\r\n')).toBe('\t<DevOnly>\r\n\t\t<div>\r\n\t\t\ttext\r\n\t\t</div>\r\n\t</DevOnly>\r\n');
});
test('recognizes nested template slots, comments and quoted greater-than signs', () => {
    const source = '<!-- <template>fake</template> --><script>const x = "<template>"</script><template><template #default><div title=">">real</div></template></template>';
    expect(templateSelection(source, source.indexOf('real'), source.indexOf('real') + 4)).toBe(true);
    expect(templateSelection(source, source.indexOf('fake'), source.indexOf('fake') + 4)).toBe(false);
});
test.each(['<script>const value = 1;</script>', '<style>.red { color: red }</style>', '<template lang="pug">div</template>', '<template src="./other.html">div</template>'])('rejects unsupported selection in %s', source => {
    const start = source.indexOf('>') + 1; const end = source.indexOf('</');
    expect(templateSelection(source, start, end)).toBe(false);
});
test('rejects empty/cross-block selections and arbitrary component names', () => {
    const source = '<template>hello</template><script>world</script>';
    expect(templateSelection(source, 10, 10)).toBe(false);
    expect(templateSelection(source, 10, source.length)).toBe(false);
    expect(() => wrapSelection(source, 10, 15, 'Bad' as any, '  ', '\n')).toThrow('supported');
});
